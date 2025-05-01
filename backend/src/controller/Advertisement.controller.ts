import { Request, Response } from 'express';
import { getSpotAdvData, getWholeAdvContentService, changeAdvPropertyService, getAdvIdsAndNamesService, createNewAdvWithSpotIdsService } from '../service/Advertisement.service';

// get all advertisements page for a venue
export const getAllAdvForVenue = async (req: Request, res: Response): Promise<void> => {
    try {
        const { venue_id } = req.params;
        const processedAdvs = await getSpotAdvData(venue_id);
        res.json(processedAdvs);
    } catch (error) {
        console.error('Error in getSpotAdv:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// get the whole content for a advertiser
export const getWholeAdvContentController = async (req: Request, res: Response) => {
    try {
        const { adv_id } = req.params;
        const { email } = req.body;  // 或者 req.query

        const result = await getWholeAdvContentService(email, adv_id);

        if (!result) {
            return res.status(404).json({ error: 'No content found' });
        }
        res.json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        switch (errorMessage) {
            case 'failed to get user email':
                return res.status(404).json({ error: 'failed to get user email' });
            case 'Validation error':
                return res.status(404).json({ error: 'Validation error' });
            case 'Adv and User mismatch':
                return res.status(404).json({ error: 'Adv and User mismatch' });
            case 'Endpoint not found or no content associated':
                return res.status(404).json({ error: 'Endpoint not found or no content associated' });
            default:
                return res.status(500).json({ error: errorMessage });
        }
    }
};

// change a advertiser banner or special time (property)
export const changeAdvPropertyController = async (req: Request, res: Response) => {
    try {
        // 1. 从 `req.params` 获取 adv_id
        const { adv_id } = req.params;
        // 2. 从 `req.body` 获取其它字段
        const { email, specials, image, name, alias } = req.body;

        const adv = await changeAdvPropertyService({
            email,
            adv_id,
            specials,
            image,
            name,
            alias,
        });

        res.status(200).json({ message: 'Adv property successfully changed' });
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case 'Insufficient Parameters':
                    return res.status(400).json({ error: 'Insufficient Parameters' });
                case 'User not found':
                    return res.status(404).json({ error: 'User not found' });
                case 'Adv not found':
                    return res.status(404).json({ error: 'Adv not found' });
                default:
                    console.error('changeAdvPropertyController error:', error);
                    return res.status(500).json({ error: error.message });
            }
        }
        return res.status(500).json({ error: 'Unknown error' });
    }
};


//
export const getAdvIdsAndNamesController = async (req: Request, res: Response) => {
    try {

        const { email } = req.body;

        // 调用 service 层方法
        const advs = await getAdvIdsAndNamesService(email);
        // 返回结果
        res.status(200).json(advs);
    } catch (error) {
        console.error('Error in getAdvIdsAndNamesController:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


export const createNewAdvWithSpotIdsController = async (req: Request, res: Response) => {
    try {
        const { userEmail, email, userId, name, venueIds, permissionLevel } = req.body;

        const result = await createNewAdvWithSpotIdsService({
            userEmail,
            email,
            userId,
            name,
            venueIds,
            permissionLevel
        });

        return res.status(201).json(result);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage === 'Insufficient Parameters') {
            return res.status(400).json({ error: errorMessage });
        }
        if (errorMessage === 'Permission Error') {
            return res.status(404).json({ error: 'Permission Error' });
        }
        if (errorMessage === 'User not found') {
            return res.status(404).json({ error: errorMessage });
        }
        if (errorMessage === 'This is a duplicated Adv') {
            return res.status(400).json({ error: errorMessage });
        }
        if (errorMessage === 'New content ID is missing') {
            return res.status(400).json({ error: errorMessage });
        }

        console.error('Error in createNewAdvWithSpotIdsController:', error);
        return res.status(500).json({ error: errorMessage });
    }
};