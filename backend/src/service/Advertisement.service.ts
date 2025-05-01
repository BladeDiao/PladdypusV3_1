import { Op } from 'sequelize';
import redisClients from '../config/redis.config';
import Adv from '../model/Adv.model';
import Content from '../model/Content.model';
import User from '../model/User.model';
import ContentEntry from '../model/ContentEntry.model';
import VenueAdvEntry from '../model/VenueAdvEntry.model';
import { generateId } from '../middleware/IdGenerator.middleware';
import UserAssignment from '../model/UserAssignment';

const dataCache = redisClients.dataCache;

// Get the advertisement data for a spot
export const getSpotAdvData = async (venue_id: string) => {
    // 1. 先检查缓存
    const cachedAdv = await dataCache.get(`${venue_id}_adv`);
    if (cachedAdv) {
        return JSON.parse(cachedAdv);
    }

    // 2. 通过 `venue_adv_entry` 表找到所有 `advId`
    const venueAdvEntries = await VenueAdvEntry.findAll({
        where: { venue_id: venue_id },
        attributes: ['adv_id'],
    });
    const advIds = venueAdvEntries.map(entry => entry.adv_id);

    // 如果没有任何关联的 advId，直接返回空数组
    if (!advIds || advIds.length === 0) {
        // 可以直接缓存空数组，避免重复查询
        await dataCache.set(`${venue_id}_adv`, JSON.stringify([]), 'EX', 3600 * 24);
        return [];
    }

    // 3. 在 Adv 表里查出这些广告
    const advs = await Adv.findAll({
        where: { id: { [Op.in]: advIds } },
        include: [
            {
                model: ContentEntry,
                required: false,
                where: {
                    owner_id: { [Op.col]: 'Adv.id' },
                },
                attributes: ['content_id'],
            },
        ],
    });

    const currentDate = new Date();

    // 4. 处理图像 & Special
    const processedAdvs = advs.map((adv) => {
        let image = adv.image;

        if (adv.specials && adv.specials.length > 0) {
            // 找到第一个有效期内的 special
            const validSpecial = adv.specials.find((spec) => {
                const startDate = spec.startDatetime ? new Date(spec.startDatetime) : null;
                const endDate = spec.endDatetime ? new Date(spec.endDatetime) : null;

                return (!startDate || currentDate >= startDate) &&
                    (!endDate || currentDate <= endDate);
            });

            if (validSpecial) {
                image = validSpecial.image || image;
            }
        }

        return {
            id: adv.id,
            name: adv.name,
            alias: adv.alias,
            permissionLevel: adv.permissionLevel,
            image,
            // 取 ContentEntry 里 contentId
            contentId: adv.contentEntry?.content_id || null,
        };
    });

    // 5. 存入 Redis 缓存
    await dataCache.set(`${venue_id}_adv`, JSON.stringify(processedAdvs), 'EX', 3600 * 24);

    return processedAdvs;
};

// Get whole advertisement content for advertiser
// 广度优先搜索
const fetchContentTreeBFS = async (contentIds: string[], stack: any): Promise<any> => {
    // 查找所有符合条件的内容
    const contents = await Content.findAll({
        where: {
            id: {
                [Op.in]: contentIds
            }
        }
    }) as Content[];

    // 根据 contentIds 的顺序对内容进行排序
    const contentsByOrder = contentIds.map(id => contents.find(content => content?.id === id));

    // 提取 dataValues
    const contentsRaw = contentsByOrder.map(content => content?.dataValues).filter(content => content !== undefined);

    // 初始化下一次查询的堆栈
    let nextQueryStack: string[] = [];
    contentsRaw.forEach(content => {
        if (content && content.attributes && content.attributes.length > 0) {
            nextQueryStack = [...nextQueryStack, ...content.attributes];
        }
    });

    // 如果没有更多子内容，则返回当前内容
    if (nextQueryStack.length === 0) {
        return contentsRaw;
    } else {
        // 递归查找子内容
        const sonContent = await fetchContentTreeBFS(nextQueryStack, stack);
        let offset = 0; // 用于跟踪子内容的位置

        // 将子内容分配回父内容中的 attributes 属性
        for (let i = 0; i < contentsRaw.length; i++) {
            const range = contentsRaw[i]?.attributes?.length ?? 0;
            if (range > 0) {
                contentsRaw[i]!.attributes = sonContent.slice(offset, offset + range);
                offset += range;
            }
        }

        return contentsRaw;
    }
};

const filterContent = (content: any, filterVisible: boolean): any => {
    let rest: any;
    if (filterVisible) {
        const { createdAt, updatedAt, editable, visible, ...remaining } = content;
        rest = remaining;
    } else {
        const { createdAt, updatedAt, ...remaining } = content;
        rest = remaining;
    }
    if (rest.attributes) {
        rest.attributes = rest.attributes.map((attr: any) => filterContent(attr, filterVisible)).filter((attr: any) => attr !== null);
    }
    return rest;

};


export const getWholeAdvContentService = async (
    email: string,
    adv_id: string
) => {
    // 1. 验证用户
    if (!email) {
        throw new Error('failed to get user email');
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error('Validation error');
    }

    // 2. 验证 Adv（确认为该用户所有）
    const assign = await UserAssignment.findOne({
        where: {
            user_id: user.id,
            targetType: 'adv',
            target_id: adv_id
        }
    });
    if (!assign) {
        throw new Error('No permission to access this adv');
    }


    const adv = await Adv.findOne({
        where: { id: adv_id },
        attributes:{exclude: ['createdAt', 'updatedAt']}
    });
    if (!adv) {
        throw new Error('Adv and User mismatch');
    }

    // 3. 查找 ContentEntry
    const endpoint = await ContentEntry.findOne({ where: { owner_id: adv.id } });
    if (!endpoint || !endpoint.content_id) {
        throw new Error('Endpoint not found or no content associated');
    }

    // 4. 获取内容树 (广度优先)
    const contentTreeList = await fetchContentTreeBFS([endpoint.content_id], []);
    const contentTree = contentTreeList.length > 0 ? contentTreeList[0] : null;

    // 5. 过滤不必要字段（示例中 filterVisible=false）
    if (contentTree) {
        return filterContent(contentTree, false);
    } else {
        return null;
    }
};

// Change a advertiser banner or special time (property)
interface ChangeAdvPropertyParams {
    email: string;
    adv_id: string;
    specials: any;
    image: string;
    name: string;
    alias?: string;
}

export const changeAdvPropertyService = async (params: ChangeAdvPropertyParams) => {
    const { email, adv_id, specials, image, name, alias } = params;

    if (adv_id === undefined || specials === undefined || image === undefined || name === undefined) {
        throw new Error('Insufficient Parameters');
    }

    // 1. 查找用户
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
        throw new Error('User not found');
    }

    // 2. 查找对应的广告
    const assign = await UserAssignment.findOne({
        where: {
            user_id: user.id,
            targetType: 'adv',
            target_id: adv_id
        }
    });
    if (!assign) {
        throw new Error('No permission to access this adv');
    }

    const adv = await Adv.findOne({
        where: { id: adv_id }, attributes:{exclude: ['createdAt', 'updatedAt']}
    });
    if (!adv) {
        throw new Error('Adv not found');
    }

    // 3. 更新属性
    await adv.update({ specials, image, name, alias });

    return adv;
};

//get all advs id and name
export const getAdvIdsAndNamesService = async (email: string) => {

    if (email === undefined) {
        throw new Error('Insufficient Parameters');
    }

    // 使用 Sequelize 查询所有 Adv 的 id 和 name
    const advs = await Adv.findAll({
        attributes: ['id', 'name'] // 只选择 id 和 name 字段
    });

    return advs;
};

// create a new advertisement with spot ids
interface CreateNewAdvWithSpotIdsParams {
    userEmail: string;
    email: string;          // 当前操作用户Email
    userId: string;         // 要给哪个用户创建广告
    name: string;           // 新广告名称
    venueIds: string[];      // Venue IDs (原 spotIds)
    permissionLevel: number;
}

/**
 * 创建新的广告，并通过中间表 `venue_adv_entry` 关联多个Venue
 */
export const createNewAdvWithSpotIdsService = async (
    params: CreateNewAdvWithSpotIdsParams
): Promise<{ message: string; adv: Adv }> => {
    const { userEmail, userId, name, venueIds, permissionLevel } = params;

    // 1. 参数检查
    if (!userId || !name || !venueIds || permissionLevel === undefined || !userEmail) {
        throw new Error('Insufficient Parameters');
    }

    // 3. 查找目标用户
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
        throw new Error('User not found');
    }

    // 4. 检查是否重复
    const isDuplicatedAdv = await Adv.findOne({
        where: { name },
        // 如果你只关心是否存在，可以只查 id
        attributes: ['id', 'name']
    });
    if (isDuplicatedAdv) {
        throw new Error('This is a duplicated Adv');
    }

    // 5. 创建新的 Adv (不再直接存 spotIds 到 adv)
    const newAdvId = generateId('adv');
    const newAdvData = {
        id: newAdvId,
        user_id: userId,
        name: name,
        permissionLevel,
        specials: [],
        image: "",
    };
    const newAdv = await Adv.create(newAdvData as any);

    // 6. 在中间表 venue_adv_entry 中，为每个 spotId 创建关联记录
    for (const venueId of venueIds) {
        await VenueAdvEntry.create({
            id: generateId('venueAdvEntry'),
            adv_id: newAdv.id,
            venue_id: venueId
        } as any);
    }

    // 7. 创建 Content & ContentEntry
    const newAdvContentPoint = {
        isLeaf: true,
        layoutStyle: "none",
        visible: true,
        editable: user.id,
        attributes: [],
        name: "",
        description: "",
        mainText: "",
        iconImage: "",
        bannerImage: "",
        carouselImages: [],
        contacts: "",
        geoLocation: "",
        searchTags: ""
    };
    const newRootContent = await Content.create(newAdvContentPoint as any);

    if (!newRootContent?.id) {
        throw new Error('New content ID is missing');
    }

    const newContentEntry = {
        id: generateId('contentEntry'),
        owner_id: newAdv.id,
        content_id: newRootContent.id,
        ownerType: "adv"
    };
    await ContentEntry.create(newContentEntry as any);

    // 8. 返回结果
    return {
        message: 'Adv has been created successfully',
        adv: newAdv
    };
};