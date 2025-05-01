import { Request, Response } from 'express';
import { getClientIp, handleVenueClick, handleAdvClick, handleContentClick, getTrendAndRegionService, getUserPlatformForVenueService, getAdvLogSummaryService, getContentLogAnalyticsService} from '../service/Analysis.service';

// Venue click log
export const uploadVenueClick = async (req: Request, res: Response): Promise<void> => {
    try {
        const { venue_id, userAgent, width, height, pixelRatio, maxTouchPoints, hardwareConcurrency, timeZone, userIdentifier } = req.body;

        // 检查是否缺少参数
        const missingParams = [
            'venue_id', 'userAgent', 'width', 'height', 'pixelRatio', 'maxTouchPoints', 'hardwareConcurrency', 'timeZone', 'userIdentifier'
        ].filter(param => req.body[param] === undefined);

        if (missingParams.length > 0) {
            res.status(400).json({ error: 'Insufficient Parameters', missingParams });
            return;
        }

        const clientIp = await getClientIp(req);
        const response = await handleVenueClick(venue_id, userAgent, width, height, pixelRatio, maxTouchPoints, hardwareConcurrency, timeZone, userIdentifier, clientIp);

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const uploadAdvClick = async (req: Request, res: Response): Promise<void> => {
    try {
        const { venue_id, adv_id, origin, userAgent, width, height, pixelRatio, maxTouchPoints, hardwareConcurrency, timeZone, userIdentifier } = req.body;

        // 检查是否缺少参数
        const missingParams = [
            'venue_id', 'adv_id', 'origin', 'userAgent', 'width', 'height', 'pixelRatio', 'maxTouchPoints', 'hardwareConcurrency', 'timeZone', 'userIdentifier'
        ].filter(param => req.body[param] === undefined);

        if (missingParams.length > 0) {
            res.status(400).json({ error: 'Insufficient Parameters', missingParams });
            return;
        }

        const clientIp = getClientIp(req);
        const response = await handleAdvClick(
            venue_id, adv_id, origin, userAgent, width, height, pixelRatio, maxTouchPoints, hardwareConcurrency, timeZone, userIdentifier, clientIp
        );

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

export const uploadContentClick = async (req: Request, res: Response): Promise<void> => {
    try {
        const { venue_id, userAgent, width, height, pixelRatio, maxTouchPoints, hardwareConcurrency, timeZone, userIdentifier, type, contactType, mapType, contentId } = req.body;

        // **检查是否缺少基本参数**
        const requiredParams = ['venue_id', 'userAgent', 'width', 'height', 'pixelRatio', 'maxTouchPoints', 'hardwareConcurrency', 'timeZone', 'userIdentifier', 'type'];
        const missingParams = requiredParams.filter(param => req.body[param] === undefined);

        if (missingParams.length > 0) {
            res.status(400).json({ error: 'Insufficient Parameters', missingParams });
            return;
        }

        // **检查 `type` 相关的参数**
        let extraParams: any = {};
        if (type === "Contact") {
            if (!contactType) {
                res.status(400).json({ error: 'Insufficient Parameters for contactType' });
                return;
            }
            extraParams.contactType = contactType;
        } else if (type === "Map") {
            if (!mapType) {
                res.status(400).json({ error: 'Insufficient Parameters for mapType' });
                return;
            }
            extraParams.mapType = mapType;
        } else if (type === "Content") {
            if (!contentId) {
                res.status(400).json({ error: 'Insufficient Parameters for contentId' });
                return;
            }
            extraParams.contentId = contentId;
        } else {
            res.status(400).json({ error: 'Invalid type provided' });
            return;
        }

        // **获取客户端 IP**
        const clientIp = getClientIp(req);

        // **调用 `service` 处理逻辑**
        const response = await handleContentClick(
            venue_id, userAgent, width, height, pixelRatio, maxTouchPoints, hardwareConcurrency, timeZone, userIdentifier, type, extraParams, clientIp
        );

        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

//Get Trend And Region Controller
export const getTrendAndRegionController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, venue_id, startDate, endDate, userTimeZone } = req.body;

        // 调用 service
        const result = await getTrendAndRegionService({
            email,
            venue_id,
            startDate,
            endDate,
            userTimeZone,
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in getTrendAndRegion:', error);
        if (error instanceof Error) {
            switch (error.message) {
                case 'Insufficient Parameters':
                    return res.status(400).json({ error: error.message });
                case 'TimeZone must be a string':
                    return res.status(400).json({ error: error.message });
                case 'Spot not found':
                    return res.status(404).json({ error: error.message });
                default:
                    if (error.message.startsWith('Permission denied')) {
                        return res.status(403).json({ error: error.message });
                    }
                    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
            }
        }
        // 兜底
        return res.status(500).json({ error: 'Failed to fetch data', details: 'Unknown error occurred' });
    }
};

//Get User Platform For Venue Controller

export const getUserPlatformForVenueController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, venue_id, startDate, endDate, userTimeZone } = req.body;

        const result = await getUserPlatformForVenueService({
            email,
            venue_id,
            startDate,
            endDate,
            userTimeZone
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in getUserPlatFormForVenue:', error);
        if (error instanceof Error) {
            switch (error.message) {
                case 'Insufficient Parameters':
                    return res.status(400).json({ error: error.message });
                case 'TimeZone must be a string':
                    return res.status(400).json({ error: error.message });
                case 'Venue not found':
                    return res.status(404).json({ error: error.message });
                default:
                    if (error.message.startsWith('Permission denied.')) {
                        return res.status(403).json({ error: error.message });
                    }
                    return res.status(500).json({
                        error: 'Failed to fetch data',
                        details: error.message,
                    });
            }
        }
        return res.status(500).json({
            error: 'Failed to fetch data',
            details: 'Unknown error occurred',
        });
    }
};

// Get Adv Log summary
export const getAdvLogSummaryController = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { email, adv_id, startDate, endDate, userTimeZone } = req.body;

        const result = await getAdvLogSummaryService({
            email,
            adv_id,
            startDate,
            endDate,
            userTimeZone,
        });

        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in getAdvLogSummary:', error);

        if (error instanceof Error) {
            switch (error.message) {
                case 'Insufficient Parameters':
                    return res.status(400).json({ error: error.message });
                case 'TimeZone must be a string':
                    return res.status(400).json({ error: error.message });
                default:
                    return res.status(500).json({ error: 'Failed to fetch data', details: error.message });
            }
        }

        return res.status(500).json({ error: 'Failed to fetch data', details: 'Unknown error' });
    }
};

// Get Content Log summary
export const getContentLogAnalyticsController = async (req: Request, res: Response) => {
    try {
        const { email, venue_id, startDate, endDate, userTimeZone } = req.body;

        const analyticsData = await getContentLogAnalyticsService({
            email, 
            venue_id,
            startDate,
            endDate,
            userTimeZone,
        });

        res.json(analyticsData);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        switch (errorMessage) {
            case 'Missing required parameters':
                return res.status(400).json({ error: errorMessage });
            case 'Spot not found':
                return res.status(404).json({ error: errorMessage });
            default:
                if (errorMessage.startsWith('Permission denied')) {
                    return res.status(403).json({ error: errorMessage });
                }
                console.error('Error in getContentLogAnalytics:', errorMessage);
                return res.status(500).json({ error: errorMessage });
        }
    }
};