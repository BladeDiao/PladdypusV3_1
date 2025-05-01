import redisClients from '../config/redis.config';
import Venue from '../model/Venue.model';
import ContentEntry from '../model/ContentEntry.model';
import ArticleEntry from '../model/ArticleEntry.model';
import Article from '../model/Article.model';
import Area from '../model/Area.model';
import User from '../model/User.model';
import Content from '../model/Content.model';
import { Op } from 'sequelize';
import AreaArticleEntry from '../model/AreaArticleEntry.model';
import UserAssignment from '../model/UserAssignment';

const dataCache = redisClients.captchaCache;
const articleDataCache = redisClients.articleCache;

// Get the home page data for a venue
export const getVenueHomeData = async (venue_id: string): Promise<any> => {
    // **检查缓存**
    const cachedHome = await dataCache.get(`${venue_id}_venue`);
    if (cachedHome) {
        return JSON.parse(cachedHome);
    }

    // **查询 `venue`**
    const venue = await Venue.findByPk(venue_id);
    if (!venue) {
        throw new Error('Venue not found');
    }

    // **去除不必要字段**
    const { id, createdAt, updatedAt, ...venueClean } = venue.dataValues;

    // **缓存数据**
    await dataCache.set(`${venue_id}_venue`, JSON.stringify(venueClean), 'EX', 3600 * 24);

    return venueClean;
};


// get all articles for a venue
export const getAllArticlesCached = async (): Promise<any[]> => {
    // 1. 检查 Redis 缓存
    const cachedArticles = await articleDataCache.get('articleCollection');
    if (cachedArticles) {
        return JSON.parse(cachedArticles);
    }

    // 2. 查询所有 `Article`
    const allArticles = await Article.findAll({ attributes: ['id', 'name'] });

    // 3. 为每个 Article 查询对应的 areaId，并拿到 areaName
    const articleList = await Promise.all(
        allArticles.map(async article => {
            // 查找与该 Article 关联的所有 areaId
            const areaArticleEntries = await AreaArticleEntry.findAll({
                where: { article_id: article.id },
                attributes: ['area_id']
            });

            // 查找每个 areaId 对应的 Area 并取 name
            const areaNames = await Promise.all(
                areaArticleEntries.map(async entry => {
                    const area = await Area.findByPk(entry.area_id);
                    return area?.name || 'Unknown Area';
                })
            );

            return {
                articleId: article.id,
                articleName: article.name,
                // 这里的 locationInfo 替换为数组
                locationInfo: areaNames.length > 0 ? areaNames : ['No location info available']
            };
        })
    );

    // 4. 存入 Redis 缓存，有效期 7 天
    await articleDataCache.set('articleCollection', JSON.stringify(articleList), 'EX', 3600 * 24 * 7);

    return articleList;
};

// Get all selected articles for a venue
export const getAllArticlesForVenue = async (venue_id: string): Promise<any[]> => {
    // 查询 `Spot`
    const targetSpot = await Venue.findByPk(venue_id);
    if (!targetSpot) {
        throw new Error('Spot ID cannot be found');
    }

    // 查询 `ContentEntry`
    const contentEntry = await ContentEntry.findOne({ where: { owner_id: targetSpot.id } });
    if (!contentEntry) {
        throw new Error('ContentEntry cannot be found');
    }

    // 查询 `ArticleEntry`
    const articleEntries = await ArticleEntry.findAll({
        where: { content_entry_id: contentEntry.id },
        attributes: ['article_id', 'masterEntry']
    });

    // 查询每个 `Article`
    const articlesForSpot = await Promise.all(
        articleEntries.map(async (entry) => {
            const articleData = await Article.findByPk(entry.article_id);

            // 4.1 查找该文章关联的所有 Area
            const areaArticleEntries = await AreaArticleEntry.findAll({
                where: { article_id: entry.article_id },
                attributes: ['area_id']
            });

            // 4.2 根据 areaId 查找 Area.name
            const areaNames = await Promise.all(
                areaArticleEntries.map(async (areaArticleEntry) => {
                    const area = await Area.findByPk(areaArticleEntry.area_id);
                    return area?.name ?? 'Unknown Area';
                })
            );

            return {
                id: articleData?.id || entry.article_id,
                name: articleData?.name || 'Unknown Article',
                image: articleData?.image || '',
                locationInfo: areaNames.length ? areaNames : ['No location info available'],
                masterEntry: entry?.masterEntry ?? 'testing for masterEntry',
                description: articleData?.description,
                paragraphs: articleData?.paragraphs
            };
        })
    );

    return articlesForSpot;
};

// get whole content for a venue with visibility
//获取 Venue 的内容树
export const getWholeSpotContentService = async (email: string, venue_id: string): Promise<any[]> => {

    // 1. 验证用户
    if (!email) {
        throw new Error('failed to get user email');
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error('Validation error');
    }

    // 2. 验证 venue 所属关系
    const assign = await UserAssignment.findOne({
        where: {
            user_id: user.id,
            targetType: 'venue',
            target_id: venue_id
        }
    });
    if (!assign) {
        throw new Error('No permission to access this venue');
    }

    const venue = await Venue.findOne({
        where: { id: venue_id },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
    if (!venue) {
        throw new Error('Spot and User mismatch');
    }

    // 3. 查找 ContentEntry
    const endpoint = await ContentEntry.findOne({ where: { owner_id: venue.id } });
    if (!endpoint || !endpoint.content_id) {
        throw new Error('Endpoint not found or no content associated');
    }

    // 4. 找到 `contentRoot`，然后找出 "HotelManagedEndpoint"
    const contentRoot = await Content.findOne({ where: { id: endpoint.content_id } }) as Content;
    if (!contentRoot) {
        throw new Error('Content root not found');
    }

    const contentRootList = await Content.findAll({
        where: {
            id: {
                [Op.in]: contentRoot.attributes
            }
        }
    }) as Content[];

    const contentSpotStart = contentRootList.find(c => c.searchTags === 'HotelManagedEndpoint');
    if (!contentSpotStart) {
        throw new Error('No Spot Managed Endpoint Found');
    }

    // 5. BFS 拿到内容树
    const contentTreeList = await fetchContentTreeBFS([contentSpotStart.id], []);
    if (!contentTreeList.length) {
        throw new Error('Empty content tree');
    }

    // 6. 过滤并返回
    const contentTree = filterContent(contentTreeList[0], false);
    return contentTree;
};

//BFS 递归获取内容树
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

// get whole content node Ids for a venue
export const getWholeSpotContentValidNodeContentService = async (
    email: string,
    venue_id: string
): Promise<Record<string, string>> => {
    // 1. 验证 email
    if (!email) {
        throw new Error('failed to get user email');
    }
    // 2. 查用户
    const user = await User.findOne({ where: { email } });
    if (!user) {
        throw new Error('Validation error');
    }
    // 3. 权限检查
    const assign = await UserAssignment.findOne({
        where: {
            user_id: user.id,
            targetType: 'venue',
            target_id: venue_id
        }
    });
    if (!assign) {
        throw new Error('No permission to access this venue');
    }
    // 4. 确认 venue 存在
    const venue = await Venue.findByPk(venue_id, {
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    if (!venue) {
        throw new Error('Spot and User mismatch');
    }
    // 5. 拿到内容根节点
    const endpoint = await ContentEntry.findOne({
        where: { owner_id: venue.id }
    });
    if (!endpoint || !endpoint.content_id) {
        throw new Error('Endpoint not found or no content associated');
    }
    const contentRoot = await Content.findByPk(
        endpoint.content_id
    );
    if (!contentRoot) {
        throw new Error('Content root missing');
    }
    // 6. 拉一批 Content（按 attributes 列表）
    const contentRootList = await Content.findAll({
        where: {
            id: { [Op.in]: contentRoot.attributes || [] }
        }
    });
    // 7. 找到那棵“入口”子树
    const entryNode = contentRootList.find(
        c => c.searchTags === 'HotelManagedEndpoint'
    );
    if (!entryNode) {
        throw new Error('No Spot Managed Endpoint Found');
    }
    const treeArray = await fetchContentTreeBFS([entryNode.id], []);
    const contentTree = filterContent(treeArray[0], false);

    // 8. 遍历整棵子树，收集所有节点（不只是叶子）
    const collectAllNodes = (
        node: any,
        map: Record<string, string>
    ) => {
        map[node.id] = node.name;
        if (Array.isArray(node.attributes)) {
            node.attributes.forEach((child: any) =>
                collectAllNodes(child, map)
            );
        }
        return map;
    };
    const allNodeIds = collectAllNodes(contentTree, {});

    return allNodeIds;
};

//通过ids获取内容名称
interface contentNameDict {
    [key: string]: string;
}

export const getContentNamesByIdsService = async (ids: string[]): Promise<contentNameDict> => {
    // 1. 查询数据库
    const contentRecords = await Content.findAll({
        where: {
            id: ids,
        },
    });

    // 2. 构建 id: name 的字典
    const result: contentNameDict = {};
    contentRecords.forEach((content) => {
        result[content.id] = content.name; // 假设每个 Content 都有 `id` 和 `name`
    });

    return result;
};

// Change a venue property
export const changeSpotPropertyService = async (
    email: string,
    venue_id: string,
    landing: Record<string, any>,
    theme: Record<string, any>,
    contact: Record<string, any>
) => {
    // 1. 验证参数
    if (!venue_id || !landing || !theme || !contact) {
        throw new Error('Insufficient Parameters');
    }

    // 2. 查找用户
    const user = await User.findOne({ where: { email: email } });
    if (!user) {
        throw new Error('User not found');
    }

    // 3. 查找对应的 `venue`
    const assign = await UserAssignment.findOne({
        where: {
            user_id: user.id,
            targetType: 'venue',
            target_id: venue_id
        }
    });
    if (!assign) {
        throw new Error('No permission to access this venue');
    }

    const spot = await Venue.findOne({
        where: { id: venue_id },
        attributes: { exclude: ['createdAt', 'updatedAt'] }
    });
    if (!spot) {
        throw new Error('Spot not found');
    }

    console.log('+++++++++++++++++++++++++++++++++++++++++++++++');
    console.log('landing', landing);
    console.log('theme', theme);
    console.log('contact', contact);

    // 4. 更新 `Spot` 属性
    await spot.update({
        landing,
        theme,
        contact
    });

    return spot; // 可返回更新后的 spot 对象
};