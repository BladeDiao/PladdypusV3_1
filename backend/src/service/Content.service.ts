import redisClients from '../config/redis.config';
import ContentEntry from '../model/ContentEntry.model';
import { Transaction } from 'sequelize';
import sequelize from '../config/postgresql.config';
import User from '../model/User.model';
import Content, { LayoutStyle, GeoLocation } from '../model/Content.model';
import { Contact } from '../model/Venue.model';
import { label } from 'aws-sdk/clients/sns';

const dataCache = redisClients.captchaCache;

//getVenueContentData
export const getVenueContentData = async (venue_id: string): Promise<any> => {
    // **检查缓存**
    const cachedContent = await dataCache.get(`${venue_id}_content`);
    if (cachedContent) {
        return JSON.parse(cachedContent);
    }

    // **查询 ContentEntry**
    const endpoint = await ContentEntry.findOne({ where: { owner_id: venue_id } });

    if (!endpoint || !endpoint.content_id) {
        throw new Error('Endpoint not found or no content associated');
    }

    // **递归获取 `content` 树**
    const contentTreeList = await fetchContentTree(endpoint.content_id, true);
    const contentTree = filterContent(contentTreeList, true);

    // **缓存数据**
    await dataCache.set(`${venue_id}_content`, JSON.stringify(contentTree), 'EX', 3600 * 24);

    return contentTree;
};

/**
 * 递归获取 `Content` 树
 */
const fetchContentTree = async (contentId: string, filterVisible: boolean = true): Promise<any> => {
    const contentRaw = await Content.findByPk(contentId);
    if (!contentRaw) {
        throw new Error(`Content with ID ${contentId} not found`);
    }

    const content = contentRaw.dataValues;

    if (content.isLeaf || !content.attributes || content.attributes.length === 0) {
        return content;
    }

    const attributes = (await Promise.all(
        content.attributes.map(async (attrId: string) => {
            const childContent = await fetchContentTree(attrId.toString(), filterVisible);
            return filterVisible && !childContent.visible ? null : childContent;
        })
    )).filter(attr => attr !== null);

    return { ...content, attributes };
};

/**
 * 过滤 `Content` 的不必要字段
 */
const filterContent = (content: any, filterVisible: boolean): any => {
    const { createdAt, updatedAt, editable, visible, ...remaining } = filterVisible ? content : content;

    if (remaining.attributes) {
        remaining.attributes = remaining.attributes.map((attr: any) => filterContent(attr, filterVisible)).filter(Boolean);
    }

    return remaining;
};

//Swap Content Service
export const swapContentService = async (
    email: string,
    content_parent_id: string,
    content_former_id: string,
    content_latter_id: string
) => {
    let transaction: Transaction | undefined;
    try {
        // 1. 参数检查
        if (!email || !content_parent_id || !content_former_id || !content_latter_id) {
            throw new Error('Insufficient Parameters');
        }

        // 2. 用户验证
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('Validation error');
        }

        // 3. 开启事务
        transaction = await sequelize.transaction();

        // 4. 批量查找内容
        const [contentParent, contentFormer, contentLatter] = await Promise.all([
            Content.findByPk(content_parent_id, { transaction }),
            Content.findByPk(content_former_id, { transaction }),
            Content.findByPk(content_latter_id, { transaction })
        ]);

        if (!contentParent || !contentFormer || !contentLatter) {
            throw new Error('One or more contents not found');
        }

        // 5. 权限检查 (editable)
        if (user.permissionLevel < 9) {
            if (
                contentParent.editable !== user.id ||
                contentFormer.editable !== user.id ||
                contentLatter.editable !== user.id
            ) {
                throw new Error('You do not have permission to edit this content');
            }
        }

        // 6. 检查 attributes 里是否包含 former & latter
        const attributes = contentParent.attributes as string[];
        const hasFormerId = attributes.includes(content_former_id);
        const hasLatterId = attributes.includes(content_latter_id);

        if (!hasFormerId || !hasLatterId) {
            throw new Error('Content IDs not found in parent attributes');
        }

        // 7. 获取 former & latter 的索引，确保 formerIndex < latterIndex
        const formerIndex = attributes.indexOf(content_former_id);
        const latterIndex = attributes.indexOf(content_latter_id);

        if (formerIndex >= latterIndex) {
            throw new Error('content_former_id must appear before content_latter_id in attributes list, try to exchange them');
        }

        // 8. 交换属性
        const newAttributes = attributes.map(attrId => {
            if (attrId === content_former_id) return content_latter_id;
            if (attrId === content_latter_id) return content_former_id;
            return attrId;
        });

        // 9. 更新父内容
        await contentParent.update({ attributes: newAttributes }, { transaction });

        // 10. 提交事务
        await transaction.commit();

        return { message: 'Content IDs swapped successfully' };
    } catch (error) {
        if (transaction) await transaction.rollback();
        throw error; // 抛出错误，让上层捕获
    }
};

//Update Content Order Service
export const updateContentOrderService = async (
    email: string,
    content_parent_id: string,
    content_attribute_ids: string[]
) => {
    let transaction: Transaction | undefined;
    try {
        // 1. 参数检查
        if (!email || !content_parent_id || !content_attribute_ids || !Array.isArray(content_attribute_ids)) {
            throw new Error('Insufficient Parameters');
        }

        // 2. 验证用户
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('Validation error');
        }

        // 3. 开启事务
        transaction = await sequelize.transaction();

        // 4. 查找父节点
        const contentParent = await Content.findByPk(content_parent_id, { transaction });
        if (!contentParent) {
            throw new Error('Parent content not found');
        }

        // 5. 权限检查
        if (user.permissionLevel < 9) {
            if (contentParent.editable !== user.id) {
                throw new Error('You do not have permission to edit this content');
            }
        }

        // 6. 检查父节点的 attributes
        const oldAttributes = contentParent.attributes as string[];
        if (!Array.isArray(oldAttributes)) {
            throw new Error('Parent attributes is not an array');
        }

        if (oldAttributes.length !== content_attribute_ids.length) {
            throw new Error('New attribute list length mismatch');
        }

        // 7. 判断新列表是否与老列表包含的内容相同 (无序比较)
        const sortedOld = [...oldAttributes].sort();
        const sortedNew = [...content_attribute_ids].sort();
        for (let i = 0; i < sortedOld.length; i++) {
            if (sortedOld[i] !== sortedNew[i]) {
                throw new Error('New attribute list does not match original attributes');
            }
        }

        // 8. 更新父节点
        await contentParent.update({ attributes: content_attribute_ids }, { transaction });

        await transaction.commit();

        return { message: 'Content order updated successfully' };
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        throw error;
    }
};


//addContentController
export const addContentService = async (
    email: string,
    content_parent_id: string,
    isLeaf: boolean,
    layoutStyle: LayoutStyle,
    name: string,
    description?: string,
    mainText?: string,
    iconImage?: string,
    bannerImage?: string,
    carouselImages?: string[],
    contact?: Contact,
    geoLocation?: GeoLocation,
    searchTags?: string
) => {
    let transaction: Transaction | undefined;
    try {
        // 1. 参数检查
        if (!email || !content_parent_id || isLeaf === undefined || !layoutStyle || !name) {
            throw new Error('Insufficient Parameters');
        }

        // 2. 验证用户
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('Validation error');
        }

        // 3. 开启事务
        transaction = await sequelize.transaction();

        // 4. 构造新内容数据
        const newContentData: Content | any = {
            isLeaf,
            layoutStyle,
            visible: true,
            editable: user.id,
            attributes: [],
            name,
            description,
            mainText,
            iconImage,
            bannerImage,
            carouselImages,
            contact: contact,
            geoLocation,
            searchTags,
        };

        // 5. 创建新内容
        const newContent = await Content.create(newContentData, { transaction });

        // 6. 查找父内容
        const parentContent = await Content.findByPk(content_parent_id, { transaction });

        // 父内容必须存在且不是 leaf
        if (parentContent && !parentContent.isLeaf) {
            // 将新内容 ID 加到父内容的 attributes
            const newAttributes = [...(parentContent.attributes || []), newContent.id];
            parentContent.attributes = newAttributes;
            await parentContent.save({ transaction });

            // 提交事务
            await transaction.commit();
            return { newContent };
        } else {
            // 父内容不存在或是 leaf
            throw new Error('Parent content is a leaf or not found, cannot add child content');
        }
    } catch (error) {
        // 回滚并抛错
        if (transaction) {
            await transaction.rollback();
        }
        throw error;
    }
};

//editContentController
interface EditContentParams {
    email: string;
    content_id: string;
    visible?: boolean;
    isLeaf: boolean;
    layoutStyle: LayoutStyle;
    name?: string;
    description?: string;
    mainText?: string;
    carouselImages?: string[];
    iconImage?: string;
    bannerImage?: string;
    geoLocation?: GeoLocation;      // 视你的类型而定
    contact?: Contact;
    searchTags?: string;
}

//编辑内容
export const editContentService = async (params: EditContentParams) => {
    const {
        email,
        content_id,
        visible,
        isLeaf,
        layoutStyle,
        name,
        description,
        mainText,
        carouselImages,
        iconImage,
        bannerImage,
        geoLocation,
        contact,
        searchTags
    } = params;

    let transaction: Transaction | undefined;
    try {
        // 参数校验
        if (!email || !content_id || isLeaf === undefined || !layoutStyle) {
            throw new Error('Insufficient Parameters');
        }

        // 1. 查找用户
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('Validation error');
        }

        // 2. 开启事务
        transaction = await sequelize.transaction();

        // 3. 查找内容
        const existingContent = await Content.findByPk(content_id, { transaction });
        if (!existingContent) {
            throw new Error('Content not found');
        }

        // 4. 如果用户权限 < 9，检查 editable
        if (user.permissionLevel < 9) {
            if (existingContent.editable !== user.id) {
                throw new Error('You do not have permission to edit this content');
            }
        }

        // 5. 构建更新数据
        const updatedContent = {
            isLeaf,
            layoutStyle: layoutStyle as LayoutStyle,
            name,
            visible,
            description,
            mainText,
            carouselImages,
            iconImage,
            bannerImage,
            geoLocation: geoLocation as GeoLocation,
            contact: contact as Contact,
            searchTags
        };

        // 6. 更新内容
        await existingContent.update(updatedContent, { transaction });

        // 7. 提交事务
        await transaction.commit();

        return { existingContent };
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        throw error;
    }
};

//Delete Content
interface DeleteContentParams {
    email: string;
    content_id: string;
    content_parent_id: string;
}

//从父节点中移除子 Content
export const deleteContentService = async (params: DeleteContentParams) => {
    const { email, content_id, content_parent_id } = params;

    let transaction: Transaction | undefined;
    try {
        // 1. 参数检查
        if (!email || !content_id || !content_parent_id) {
            throw new Error('Insufficient Parameters');
        }

        // 2. 查找用户
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('Validation error');
        }

        // 3. 开启事务
        transaction = await sequelize.transaction();

        // 4. 查找子 Content 与父 Content
        const [childContent, parentContent] = await Promise.all([
            Content.findByPk(content_id, { transaction }),
            Content.findByPk(content_parent_id, { transaction }),
        ]);

        if (!childContent || !parentContent) {
            throw new Error('Content not found');
        }

        // 5. 权限检查
        if (user.permissionLevel < 9) {
            if (childContent.editable !== user.id) {
                throw new Error('You do not have permission to delete this content');
            }
        }

        // 6. 检查父 Content 的 attributes 是否包含子节点
        if (!parentContent.attributes.includes(content_id)) {
            throw new Error('Cannot match content');
        }

        // 7. 从父节点 attributes 中移除子节点 ID
        const newAttributes = parentContent.attributes.filter(id => id !== content_id);
        await parentContent.update({ attributes: newAttributes }, { transaction });

        // 如果需要真正物理删除，可以使用:
        // await childContent.destroy({ transaction });

        // 8. 提交事务
        await transaction.commit();

        return { message: 'Content deleted successfully' };
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        throw error;
    }
};

//Edit Content Visibility
interface EditContentVisibilityParams {
    email: string;
    content_id: string;
    visible: boolean;
}

//编辑 Content 的可见性 (visible)
export const editContentVisibilityService = async (params: EditContentVisibilityParams) => {
    const { email, content_id, visible } = params;

    let transaction: Transaction | undefined;
    try {
        // 1. 参数检查
        if (!email || !content_id || typeof visible !== 'boolean') {
            throw new Error('Insufficient Parameters');
        }

        // 2. 开启事务
        transaction = await sequelize.transaction();

        // 3. 查找用户
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error('Validation error');
        }

        // 4. 查找 content
        const existingContent = await Content.findByPk(content_id, { transaction });
        if (!existingContent) {
            throw new Error('Content not found');
        }

        // 5. 权限检查
        if (user.permissionLevel < 9) {
            if (existingContent.editable !== user.id) {
                throw new Error('You do not have permission to edit this content');
            }
        }

        // 6. 更新可见性
        await existingContent.update({ visible }, { transaction });

        // 7. 提交事务
        await transaction.commit();

        return { existingContent };
    } catch (error) {
        // 回滚事务并抛出错误
        if (transaction) {
            await transaction.rollback();
        }
        throw error;
    }
};