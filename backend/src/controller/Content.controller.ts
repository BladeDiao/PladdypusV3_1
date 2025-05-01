import { Request, Response } from 'express';
import { getVenueContentData, swapContentService, updateContentOrderService, addContentService, editContentService, deleteContentService, editContentVisibilityService } from '../service/Content.service';
import Content, { LayoutStyle, GeoLocation } from '../model/Content.model';
import { Contact } from '../model/Venue.model';

/**
 * 处理 "获取 `Spot` 关联 `Content` 树" 请求
 */
export const getVenueContent = async (req: Request, res: Response): Promise<void> => {
    try {
        const { venue_id } = req.params;
        const contentTree = await getVenueContentData(venue_id);
        res.json(contentTree);
    } catch (error) {
        res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
};


//swapContentController
export const swapContentController = async (req: Request, res: Response) => {
    try {
        const {
            email,
            content_parent_id,
            content_former_id,
            content_latter_id
        } = req.body;

        const result = await swapContentService(
            email,
            content_parent_id,
            content_former_id,
            content_latter_id
        );

        res.status(200).json(result);
    } catch (error) {
        // 捕获 service 抛出的错误
        if (error instanceof Error) {
            // 你可以自定义错误信息 → HTTP 状态码的映射
            switch (error.message) {
                case 'Insufficient Parameters':
                    return res.status(400).json({ error: error.message });
                case 'Validation error':
                    return res.status(404).json({ error: error.message });
                case 'One or more contents not found':
                    return res.status(404).json({ error: error.message });
                case 'You do not have permission to edit this content':
                    return res.status(403).json({ error: error.message });
                case 'Content IDs not found in parent attributes':
                    return res.status(404).json({ error: error.message });
                case 'content_former_id must appear before content_latter_id...':
                    return res.status(400).json({ error: error.message });
                default:
                    return res.status(500).json({ error: error.message });
            }
        }
    }
};

// reorder Content Controller
export const updateContentOrderController = async (req: Request, res: Response) => {
    try {
        const { email, content_parent_id, content_attribute_ids } = req.body;

        // 调用 service
        const result = await updateContentOrderService(
            email,
            content_parent_id,
            content_attribute_ids
        );

        res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case 'Insufficient Parameters':
                    return res.status(400).json({ error: error.message });
                case 'Validation error':
                    return res.status(404).json({ error: error.message });
                case 'Parent content not found':
                    return res.status(404).json({ error: error.message });
                case 'You do not have permission to edit this content':
                    return res.status(403).json({ error: error.message });
                case 'Parent attributes is not an array':
                    return res.status(400).json({ error: error.message });
                case 'New attribute list length mismatch':
                    return res.status(400).json({ error: error.message });
                case 'New attribute list does not match original attributes':
                    return res.status(400).json({ error: error.message });
                default:
                    return res.status(500).json({ error: error.message });
            }
        }

        // 兜底
        res.status(500).json({ error: 'Unknown error' });
    }
};

//addContentController
export const addContentController = async (req: Request, res: Response) => {
    let transaction;
    try {
        const {
            email,
            content_parent_id,
            isLeaf,
            layoutStyle,
            name,
            description,
            mainText,
            iconImage,
            bannerImage,
            carouselImages,
            contact,
            searchTags,
            geoLocation
        } = req.body;

        // 调用 service
        const result = await addContentService(
            email,
            content_parent_id,
            isLeaf,
            layoutStyle as LayoutStyle,
            name,
            description,
            mainText,
            iconImage,
            bannerImage,
            carouselImages,
            contact as Contact,
            geoLocation as GeoLocation,
            searchTags
        );

        // 如果成功
        return res.status(201).json({
            message: 'Content added successfully',
            content: result.newContent,
        });
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case 'Insufficient Parameters':
                    return res.status(400).json({ error: error.message });
                case 'Validation error':
                    return res.status(404).json({ error: error.message });
                case 'Parent content is a leaf or not found, cannot add child content':
                    return res.status(400).json({ error: error.message });
                default:
                    console.error(error);
                    return res.status(500).json({ error: error.message });
            }
        }
        // 兜底
        return res.status(500).json({ error: 'Unknown error' });
    }
};

export const editContentController = async (req: Request, res: Response) => {
    try {
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
        } = req.body;

        const result = await editContentService({
            email,
            content_id,
            visible,
            isLeaf,
            layoutStyle: layoutStyle as LayoutStyle,
            name,
            description,
            mainText,
            carouselImages,
            iconImage,
            bannerImage,
            geoLocation: geoLocation as GeoLocation,
            contact: contact as Contact,
            searchTags
        });

        return res.status(200).json({
            message: 'Content edited successfully',
            content: result.existingContent
        });
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case 'Insufficient Parameters':
                    return res.status(400).json({ error: error.message });
                case 'Validation error':
                    return res.status(404).json({ error: error.message });
                case 'Content not found':
                    return res.status(404).json({ error: error.message });
                case 'You do not have permission to edit this content':
                    return res.status(403).json({ error: error.message });
                default:
                    console.error(error);
                    return res.status(500).json({ error: error.message });
            }
        }
        // 兜底
        return res.status(500).json({ error: 'Unknown error' });
    }
};

//delete Content Controller
export const deleteContentController = async (req: Request, res: Response) => {
    try {
        const { email, content_id, content_parent_id } = req.body;

        const result = await deleteContentService({
            email,
            content_id,
            content_parent_id
        });

        res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case 'Insufficient Parameters':
                    return res.status(400).json({ error: error.message });
                case 'Validation error':
                    return res.status(404).json({ error: error.message });
                case 'Content not found':
                    return res.status(404).json({ error: error.message });
                case 'You do not have permission to delete this content':
                    return res.status(403).json({ error: error.message });
                case 'Cannot match content':
                    return res.status(400).json({ error: error.message });
                default:
                    console.error(error);
                    return res.status(500).json({ error: error.message });
            }
        }
        // 兜底
        return res.status(500).json({ error: 'Unknown error' });
    }
};

//editContentVisibilityController
export const editContentVisibilityController = async (req: Request, res: Response) => {
    try {
        const { email, content_id, visible } = req.body;

        const result = await editContentVisibilityService({
            email,
            content_id,
            visible
        });

        return res.status(200).json({
            message: 'Content visibility edited successfully',
            content: result.existingContent
        });
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case 'Insufficient Parameters':
                    return res.status(400).json({ error: error.message });
                case 'Validation error':
                    return res.status(404).json({ error: error.message });
                case 'Content not found':
                    return res.status(404).json({ error: error.message });
                case 'You do not have permission to edit this content':
                    return res.status(403).json({ error: error.message });
                default:
                    console.error(error);
                    return res.status(500).json({ error: error.message });
            }
        }
        // 兜底
        return res.status(500).json({ error: 'Unknown error' });
    }
};
