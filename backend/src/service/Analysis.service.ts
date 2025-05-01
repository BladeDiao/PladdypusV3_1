import Venue from '../model/Venue.model';
import Adv from '../model/Adv.model';
import AdvLog from '../model/AdvLog.model';
import VenueLog from '../model/VenueLog.model';
import ContentLog from '../model/ContentLog.model';
import sequelize from '../config/postgresql.config';
import Content from '../model/Content.model';
import moment from "moment-timezone";
import { Request, Response } from 'express';
import { Op, QueryTypes, Transaction, where, } from 'sequelize';

//Venue click log
export const getClientIp = (req: Request): string => {
    return (
        (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
        req.headers['x-real-ip'] as string ||
        req.connection.remoteAddress ||
        req.ip ||
        'Unknown IP'
    );
};

export const deviceInfoExtract = (
    userAgent: string,
    width: number,
    height: number,
    pixelRatio: number,
    maxTouchPoints: number,
    hardwareConcurrency: number,
    timeZone: string
) => {
    const detectBrowser = () => {
        if (/Firefox/i.test(userAgent)) return "Firefox";
        if (/Edg/i.test(userAgent)) return "Edge";
        if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) return "Chrome";
        if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) return "Safari";
        return "Other";
    };

    const detectOS = () => {
        if (/Windows/i.test(userAgent)) return "Windows";
        if (/Macintosh|Mac OS/i.test(userAgent)) return "MacOS";
        if (/Android/i.test(userAgent)) return "Android";
        if (/iPhone|iPad|iPod/i.test(userAgent)) return "iOS";
        return "Other";
    };

    const estimateDeviceType = () => {
        const effectiveScreenWidth = width * pixelRatio;
        const effectiveScreenHeight = height * pixelRatio;
        const screenSize = Math.sqrt(effectiveScreenWidth ** 2 + effectiveScreenHeight ** 2);

        if (maxTouchPoints > 0) {
            if (screenSize < 1200) return "Smartphone";
            if (screenSize < 1500) return "Tablet";
            return "Large Tablet";
        }
        return "Desktop";
    };

    const estimateDeviceQuality = () => {
        const effectiveResolution = Math.sqrt(width ** 2 + height ** 2) * pixelRatio;

        if (hardwareConcurrency <= 2) {
            return effectiveResolution <= 2200 ? "Low" : "Medium";
        } else {
            if (effectiveResolution <= 1800) return "Low";
            if (effectiveResolution <= 2500) return "Medium";
            return "High";
        }
    };

    return {
        browser: detectBrowser(),
        os: detectOS(),
        device: estimateDeviceType(),
        quality: estimateDeviceQuality(),
        timeZone: timeZone
    };
};

// handle venue click
export const handleVenueClick = async (
    venue_id: string,
    userAgent: string,
    width: number,
    height: number,
    pixelRatio: number,
    maxTouchPoints: number,
    hardwareConcurrency: number,
    timeZone: string,
    userIdentifier: string,
    clientIp: string
) => {
    // 检查 `Venue` 是否存在
    const venue = await Venue.findByPk(venue_id);
    if (!venue) throw new Error('Venue not found');

    const currentTime = new Date();

    // 查找最近 50-70 秒内的 `VenueLog`
    const recentVenueLog = await VenueLog.findOne({
        where: { venue_id: venue_id, userIdentifier: userIdentifier },
        order: [['createdAt', 'DESC']]
    });

    if (!recentVenueLog || currentTime.getTime() - recentVenueLog.updatedAt.getTime() > 68000) {
        // 新建 `VenueLog`
        const deviceInfo = deviceInfoExtract(userAgent, width, height, pixelRatio, maxTouchPoints, hardwareConcurrency, timeZone);

        const newVenueLog: VenueLog | any = {
            venue_id: venue_id,
            ipAddress: clientIp,
            duration: 1,
            userIdentifier: userIdentifier,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
            device: deviceInfo.device,
            timeZone: deviceInfo.timeZone
        };

        await VenueLog.create(newVenueLog);
        return { message: 'OK - 1' };
    } else {
        // 58s to 68s 内允许更新日志
        if ((currentTime.getTime() - recentVenueLog.updatedAt.getTime() >= 58000) &&
            (currentTime.getTime() - recentVenueLog.updatedAt.getTime() <= 68000)) {
            await recentVenueLog.update({ duration: recentVenueLog.duration + 1 });
            return { message: 'OK - 2' };
        } else {
            return { message: 'Deny - 1' };
        }
    }
};

// Advertisement click log
export const handleAdvClick = async (
    venue_id: string,
    adv_id: string,
    origin: string,
    userAgent: string,
    width: number,
    height: number,
    pixelRatio: number,
    maxTouchPoints: number,
    hardwareConcurrency: number,
    timeZone: string,
    userIdentifier: string,
    clientIp: string
) => {
    // 检查 `Spot` 是否存在
    const venue = await Venue.findByPk(venue_id);
    if (!venue) throw new Error('Spot not found');

    // 检查 `Adv` 是否存在
    const adv = await Adv.findByPk(adv_id);
    if (!adv) throw new Error('Adv not found');

    // 解析设备信息
    const deviceInfo = deviceInfoExtract(userAgent, width, height, pixelRatio, maxTouchPoints, hardwareConcurrency, timeZone);

    const newAdvLog: AdvLog | any = {
        venue_id: venue_id,
        adv_id: adv_id,
        ipAddress: clientIp,
        ...deviceInfo,
        origin: origin,
        userIdentifier: userIdentifier
    };

    await AdvLog.create(newAdvLog);

    return { message: 'OK - 1' };
};

// Content click log
export const handleContentClick = async (
    venue_id: string,
    userAgent: string,
    width: number,
    height: number,
    pixelRatio: number,
    maxTouchPoints: number,
    hardwareConcurrency: number,
    timeZone: string,
    userIdentifier: string,
    type: string,
    extraParams: any,
    clientIp: string
) => {

    const venue = await Venue.findByPk(venue_id);
    if (!venue) throw new Error('Spot not found');

    const deviceInfo = deviceInfoExtract(userAgent, width, height, pixelRatio, maxTouchPoints, hardwareConcurrency, timeZone);

    const newContentLog: ContentLog | any = {
        venue_id: venue_id,
        ipAddress: clientIp,
        ...deviceInfo,
        userIdentifier,
        type,
        ...extraParams // 额外参数（contactType / mapType / contentId）
    };

    await ContentLog.create(newContentLog);

    return { message: 'OK - 1' };
};

// get region and trend
interface TrendAndRegionParams {
    email: string;
    venue_id: string;
    startDate: string;
    endDate: string;
    userTimeZone: string;
    token?: string;
    token_email?: string;
}

/**
 * 获取 Trend & Region 分析数据
 */
export const getTrendAndRegionService = async (params: TrendAndRegionParams) => {
    const { venue_id, startDate, endDate, userTimeZone } = params;

    // 1. 基础参数校验
    if (!venue_id || !startDate || !endDate || !userTimeZone) {
        throw new Error('Insufficient Parameters');
    }
    if (typeof userTimeZone !== 'string') {
        throw new Error('TimeZone must be a string');
    }

    // 2. 查询 Spot
    const spot = await Venue.findOne({ attributes: ['permissionLevel'], where: { id: venue_id } });
    if (!spot || spot.permissionLevel == undefined) {
        throw new Error('Spot not found');
    }

    // 3. 如果 permissionLevel < 2，限制日期范围
    if (spot.permissionLevel < 2) {
        const todayEndUserTime = moment.tz(userTimeZone).subtract(1, 'days').endOf('day');
        const oneMonthAgoUserTime = todayEndUserTime.clone().subtract(1, 'month').startOf('day');

        const startDateMomentUTC = moment.tz(startDate, userTimeZone).utc();
        const endDateMomentUTC = moment.tz(endDate, userTimeZone).utc();

        const todayEndUTC = todayEndUserTime.clone().utc();
        const oneMonthAgoUTC = oneMonthAgoUserTime.clone().utc();

        // 检查范围
        if (startDateMomentUTC.isBefore(oneMonthAgoUTC) || endDateMomentUTC.isAfter(todayEndUTC)) {
            throw new Error(
                `Permission denied. Allowed date range is from ${oneMonthAgoUTC.format(
                    'YYYY-MM-DD HH:mm:ss'
                )} to ${todayEndUTC.format('YYYY-MM-DD HH:mm:ss')}.`
            );
        }
    }

    // 4. 将 startDate & endDate 转为 UTC，用于数据库查询
    const convertedStartDate = moment.tz(startDate, userTimeZone).utc().format();
    const convertedEndDate = moment.tz(endDate, userTimeZone).utc().format();

    // 5. 查询符合条件的 SpotLog
    const rawData = await VenueLog.findAll({
        attributes: ['createdAt', 'timeZone', 'duration'],
        where: {
            venue_id: venue_id,
            createdAt: {
                [Op.gte]: convertedStartDate,
                [Op.lte]: convertedEndDate,
            },
        },
        raw: true,
        // logging: console.log, // 如果需要查看SQL，可启用
    });

    // 6. 调整时区
    const adjustedData = rawData.map(entry => ({
        ...entry,
        recordTimeZone: entry.timeZone,
        localDate: moment.utc(entry.createdAt).tz(userTimeZone).format('YYYY-MM-DD'),
    }));

    // 7. 计算 trend
    const trend = adjustedData.reduce((acc: Record<string, number>, entry: any) => {
        acc[entry.localDate] = (acc[entry.localDate] || 0) + Number(entry.duration);
        return acc;
    }, {});

    // 8. 计算 region
    const region = adjustedData.reduce((acc: Record<string, any>, entry: any) => {
        const key = `${entry.localDate}_${entry.timeZone}`;
        acc[key] = {
            date: entry.localDate,
            timeZone: entry.recordTimeZone,
            totalDuration: (acc[key]?.totalDuration || 0) + Number(entry.duration),
        };
        return acc;
    }, {});

    // 9. 为 trend 和 region 补齐空白日期
    const userStart = moment.tz(startDate, userTimeZone).startOf('day');
    const userEnd = moment.tz(endDate, userTimeZone).endOf('day');

    // 补齐 trend
    const currentTrend = userStart.clone();
    while (currentTrend.isSameOrBefore(userEnd, 'day')) {
        const dateStr = currentTrend.format('YYYY-MM-DD');
        if (!trend[dateStr]) {
            trend[dateStr] = 0;
        }
        currentTrend.add(1, 'day');
    }

    // 补齐 region
    const timeZoneSet = new Set<string>();
    Object.values(region).forEach(item => {
        timeZoneSet.add((item as any).timeZone);
    });
    const currentRegion = userStart.clone();
    while (currentRegion.isSameOrBefore(userEnd, 'day')) {
        const dateStr = currentRegion.format('YYYY-MM-DD');
        for (const tz of timeZoneSet) {
            const key = `${dateStr}_${tz}`;
            if (!region[key]) {
                region[key] = {
                    date: dateStr,
                    timeZone: tz,
                    totalDuration: 0,
                };
            }
        }
        currentRegion.add(1, 'day');
    }

    // 10. 排序
    const sortedTrend = Object.keys(trend)
        .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
        .map(date => ({ date, totalDuration: trend[date] }));

    const sortedRegion = Object.values(region).sort((a: any, b: any) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 返回结果
    return { trend: sortedTrend, region: sortedRegion };
};


//get user platform for venue
interface UserPlatformForVenueParams {
    email: string;
    venue_id: string;
    startDate: string;
    endDate: string;
    userTimeZone: string;
}

/**
 * 获取指定 Spot 的用户平台使用情况（Browser、OS、Device）
 */
export const getUserPlatformForVenueService = async (params: UserPlatformForVenueParams) => {
    const { venue_id, startDate, endDate, userTimeZone } = params;

    // 1. 基础参数校验
    if (!venue_id || !startDate || !endDate || !userTimeZone) {
        throw new Error('Insufficient Parameters');
    }
    if (typeof userTimeZone !== 'string') {
        throw new Error('TimeZone must be a string');
    }

    // 2. 查询 Spot
    const spot = await Venue.findOne({ attributes: ['permissionLevel'], where: { id: venue_id } });
    if (!spot || spot.permissionLevel === undefined) {
        throw new Error('Venue not found');
    }

    // 3. 若 permissionLevel < 2，限制查询日期范围
    if (spot.permissionLevel < 2) {
        const todayEndUserTime = moment.tz(userTimeZone).subtract(1, 'days').endOf('day');
        const oneMonthAgoUserTime = todayEndUserTime.clone().subtract(1, 'month').startOf('day');

        const todayEndUTC = todayEndUserTime.clone().utc();
        const oneMonthAgoUTC = oneMonthAgoUserTime.clone().utc();

        const startDateMomentUTC = moment.tz(startDate, userTimeZone).utc();
        const endDateMomentUTC = moment.tz(endDate, userTimeZone).utc();

        // 超出范围则抛错
        if (startDateMomentUTC.isBefore(oneMonthAgoUTC) || endDateMomentUTC.isAfter(todayEndUTC)) {
            throw new Error(
                `Permission denied. Allowed date range is from ${oneMonthAgoUTC.format(
                    'YYYY-MM-DD HH:mm:ss'
                )} to ${todayEndUTC.format('YYYY-MM-DD HH:mm:ss')}.`
            );
        }
    }

    // 4. 将日期转换为 UTC 用于数据库查询
    const convertedStartDate = moment.tz(startDate, userTimeZone).utc().format();
    const convertedEndDate = moment.tz(endDate, userTimeZone).utc().format();

    // 5. 查询 SpotLog
    const rawData = await VenueLog.findAll({
        attributes: ['createdAt', 'browser', 'os', 'device'],
        where: {
            venue_id: venue_id,
            createdAt: {
                [Op.gte]: convertedStartDate,
                [Op.lte]: convertedEndDate,
            },
        },
        raw: true,
    });

    // 6. 转换 createdAt -> localDate
    const adjustedData = rawData.map((entry: any) => ({
        ...entry,
        localDate: moment.utc(entry.createdAt).tz(userTimeZone).format('YYYY-MM-DD'),
    }));

    // 7. 按日期分组
    const groupedByDate = adjustedData.reduce((acc: Record<string, any[]>, entry: any) => {
        acc[entry.localDate] = acc[entry.localDate] || [];
        acc[entry.localDate].push(entry);
        return acc;
    }, {});

    // 8. 定义计算每日统计的函数
    const calculateDailyStatistics = (data: any[]) => {
        const total = data.length;

        const calculatePercentage = (field: string) => {
            const counts = data.reduce((innerAcc: Record<string, number>, item: any) => {
                const value = item[field] || 'Other';
                innerAcc[value] = (innerAcc[value] || 0) + 1;
                return innerAcc;
            }, {});

            return Object.entries(counts).map(([key, value]) => ({
                type: key,
                percentage: ((value / total) * 100).toFixed(2),
                amount: value,
            }));
        };

        return {
            Browser: calculatePercentage('browser'),
            os: calculatePercentage('os'),
            device: calculatePercentage('device'),
        };
    };

    // 9. 计算每日统计
    const dailyStatistics = Object.entries(groupedByDate).map(([date, entries]) => ({
        date,
        statistics: calculateDailyStatistics(entries as any[]),
    }));

    return dailyStatistics;
};

// Get Adv Log Summary
interface AdvLogSummaryParams {
    email: string;
    adv_id: string;
    startDate: string;
    endDate: string;
    userTimeZone: string;
}

/**
 * 获取指定广告 (Adv) 的日志统计摘要
 */
export const getAdvLogSummaryService = async (params: AdvLogSummaryParams) => {
    const { adv_id, startDate, endDate, userTimeZone } = params;

    // 1. 基础参数检查
    if (!adv_id || !startDate || !endDate || !userTimeZone) {
        throw new Error('Insufficient Parameters');
    }
    if (typeof userTimeZone !== 'string') {
        throw new Error('TimeZone must be a string');
    }

    // 2. 将开始/结束日期转换为 UTC 范围
    const convertedStartDate = moment.tz(startDate, userTimeZone).utc().startOf('day').format();
    const convertedEndDate = moment.tz(endDate, userTimeZone).utc().endOf('day').format();

    // 3. 查询 `AdvLog`
    const rawData = await AdvLog.findAll({
        attributes: ['adv_id', 'venue_id', 'origin', 'createdAt'],
        where: {
            adv_id: adv_id,
            createdAt: {
                [Op.gte]: convertedStartDate,
                [Op.lte]: convertedEndDate,
            },
        },
        include: [
            {
                model: Venue,
                attributes: ['id', 'name'],
            },
        ],
        raw: true,
    });

    if (rawData.length === 0) {
        return [];
    }

    // 4. 调整时区
    const adjustedData = rawData.map((entry: any) => ({
        ...entry,
        localDate: moment.utc(entry.createdAt).tz(userTimeZone).format('YYYY-MM-DD'),
    }));

    // 5. 按日期再按 spot 分组
    const groupedByDate = adjustedData.reduce((acc: Record<string, Record<string, any[]>>, entry: any) => {
        const dateKey = entry.localDate;
        const spotKey = entry.venue_id;

        acc[dateKey] = acc[dateKey] || {};
        acc[dateKey][spotKey] = acc[dateKey][spotKey] || [];
        acc[dateKey][spotKey].push(entry);

        return acc;
    }, {});


    // 6. 生成结果
    const result = Object.entries(groupedByDate)
        .map(([date, spots]) => {
            // spots: Record<spotId, entries[]>
            const spotDetails = Object.entries(spots as Record<string, any[]>).map(([venue_id, entries]) => {
                const totalRecords = entries.length;

                // 计算 originSummary
                const originSummary = entries.reduce((originAcc: Record<string, number>, item: any) => {
                    const origin = item.origin || 'Other';
                    originAcc[origin] = (originAcc[origin] || 0) + 1;
                    return originAcc;
                }, {});

                // 页面来源
                const pageOrigins = ['Discover', 'Home', 'Article'];
                const pageSummary = Object.keys(originSummary)
                    .filter(key => pageOrigins.includes(key))
                    .reduce((acc, key) => {
                        acc[key] = originSummary[key];
                        return acc;
                    }, {} as Record<string, number>);

                // 联系来源
                const contactSummary = Object.keys(originSummary)
                    .filter(key => !pageOrigins.includes(key))
                    .reduce((acc, key) => {
                        acc[key] = originSummary[key];
                        return acc;
                    }, {} as Record<string, number>);

                const totalPageRecords = Object.values(pageSummary).reduce((sum, val) => sum + val, 0);
                const totalContactRecords = Object.values(contactSummary).reduce((sum, val) => sum + val, 0);

                const venueName = entries[0]['venue.name'] || 'Unknown';

                return {
                    venue_id,
                    venueName,
                    totalRecords,
                    totalPageRecords,
                    totalContactRecords,
                    pageSummary,
                    contactSummary,
                };
            });

            return {
                date,
                adv_id,
                totalSpotCount: spotDetails.length,
                spotDetails,
            };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // 按日期排序

    return result;
};

// Get Content Log Summary
interface ContentLogAnalyticsParams {
    email: string;
    venue_id: string;
    startDate: string;
    endDate: string;
    userTimeZone: string;
}

//获取 ContentLog 日志分析数据
export const getContentLogAnalyticsService = async (params: ContentLogAnalyticsParams) => {
    const { venue_id, startDate, endDate, userTimeZone } = params;

    // 1. 基础参数检查
    if (!venue_id || !startDate || !endDate || !userTimeZone) {
        throw new Error('Missing required parameters');
    }

    // 2. 查找 Spot
    const spot = await Venue.findOne({ attributes: ['permissionLevel', 'name'], where: { id: venue_id } });
    if (!spot) {
        throw new Error('Spot not found');
    }

    // 再次校验 permissionLevel
    if (spot.permissionLevel === undefined) {
        throw new Error('Spot not found');
    }

    // 3. 如果 permissionLevel < 2，限制可查询范围
    if (spot.permissionLevel < 2) {
        const todayEndUserTime = moment.tz(userTimeZone).subtract(1, 'days').endOf('day');
        const oneMonthAgoUserTime = todayEndUserTime.clone().subtract(1, 'month').startOf('day');

        const todayEndUTC = todayEndUserTime.clone().utc();
        const oneMonthAgoUTC = oneMonthAgoUserTime.clone().utc();

        const startDateMomentUTC = moment.tz(startDate, userTimeZone).utc();
        const endDateMomentUTC = moment.tz(endDate, userTimeZone).utc();

        if (startDateMomentUTC.isBefore(oneMonthAgoUTC) || endDateMomentUTC.isAfter(todayEndUTC)) {
            throw new Error(
                `Permission denied. Allowed date range is from ${oneMonthAgoUTC.format(
                    'YYYY-MM-DD HH:mm:ss'
                )} to ${todayEndUTC.format('YYYY-MM-DD HH:mm:ss')}.`
            );
        }
    }

    // 4. 将日期转换为 UTC 字符串
    const startDateUTC = moment.tz(startDate, userTimeZone).utc().format('YYYY-MM-DD HH:mm:ss');
    const endDateUTC = moment.tz(endDate, userTimeZone).utc().format('YYYY-MM-DD HH:mm:ss');

    // 5. 计算用户时区的开始/结束日期 (用于补空数据)
    const userStart = moment.tz(startDate, userTimeZone).startOf('day');
    const userEnd = moment.tz(endDate, userTimeZone).endOf('day');

    // 6. 查询数据库 (raw SQL)
    const logs = await sequelize.query(
        `
        SELECT 
          "createdAt" AT TIME ZONE 'UTC' AS utc_datetime,
          type,
          COUNT(*)::INTEGER AS total_count,
          CASE
              WHEN type = 'Contact' THEN "contactType"::TEXT
              WHEN type = 'Map' THEN "mapType"::TEXT
              WHEN type = 'Content' THEN "content_id"
              ELSE NULL::TEXT
          END AS subtype
        FROM "content_log"
        WHERE "venue_id" = :venue_id 
          AND "createdAt" BETWEEN :startDateUTC AND :endDateUTC
        GROUP BY utc_datetime, type, subtype
        ORDER BY utc_datetime;
      `,
        {
            type: QueryTypes.SELECT,
            replacements: { venue_id, startDateUTC, endDateUTC },
        }
    );

    // 7. 调整时区
    const local_logs = (logs as any[]).map(log => ({
        ...log,
        local_datetime: moment.tz(log.utc_datetime, userTimeZone).format('YYYY-MM-DD HH:mm:ss'),
    }));

    // 8. 收集 contentId
    const contentIds = (logs as any[])
        .filter(log => log.type === 'Content' && log.subtype)
        .map(log => log.subtype);

    // 9. 查询 Content 表拿到 contentName
    const contents = await Content.findAll({ where: { id: contentIds } });
    const contentMap = contents.reduce((map: Record<string, string>, c) => {
        map[c.id] = c.name || 'Unknown';
        return map;
    }, {});

    // 10. 分组 & 补空
    const groupedLogs: Record<string, any> = {};

    local_logs.forEach(log => {
        const { local_datetime, type, total_count, subtype } = log;
        const local_date = local_datetime.split(' ')[0];

        if (!groupedLogs[local_date]) {
            groupedLogs[local_date] = {
                date: local_date,
                venue_id,
                venueName: spot.name,
                totalContact: 0,
                totalMap: 0,
                totalContent: 0,
                Contact: {},
                Map: {},
                Content: {},
            };
        }

        const currentData = groupedLogs[local_date];
        if (type === 'Contact') {
            currentData.totalContact += total_count;
            currentData.Contact[subtype] = (currentData.Contact[subtype] || 0) + total_count;
        } else if (type === 'Map') {
            currentData.totalMap += total_count;
            currentData.Map[subtype] = (currentData.Map[subtype] || 0) + total_count;
        } else if (type === 'Content') {
            currentData.totalContent += total_count;
            const contentName = contentMap[subtype] || 'Unknown';
            currentData.Content[contentName] = (currentData.Content[contentName] || 0) + total_count;
        }
    });

    // 11. 按天补空
    const currentDay = userStart.clone();
    while (currentDay.isSameOrBefore(userEnd, 'day')) {
        const dateStr = currentDay.format('YYYY-MM-DD');
        if (!groupedLogs[dateStr]) {
            groupedLogs[dateStr] = {
                date: dateStr,
                venue_id,
                venueName: spot.name,
                totalContact: 0,
                totalMap: 0,
                totalContent: 0,
                Contact: {},
                Map: {},
                Content: {},
            };
        }
        currentDay.add(1, 'day');
    }

    // 12. 整理为数组并排序
    const analyticsData = Object.values(groupedLogs).sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return analyticsData;
};