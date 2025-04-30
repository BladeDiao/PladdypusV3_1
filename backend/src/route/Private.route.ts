import express from 'express';
// import { authenticateJWT } from '../middleware/JWT.middleware';
// import { advLevelCacheClear, contentLevelCacheClear } from '../middleware/ClearCache.middleware';
// import { sanitizeMiddleware } from '../middleware/Sanitise.middleware';
// import multer, { FileFilterCallback } from 'multer';
// import { uploadImageController, getUserInfoController, listFollowerUserController, addFollowerUserController, deleteFollowerUserController} from '../controller/User.controller';
// import {getWholeAdvContentController, changeAdvPropertyController} from '../controller/Advertisement.controller';
// import {getWholeSpotContentController, getWholeSpotContentValidLeafContentController, getContentNamesByIdsController, changeSpotPropertyController} from '../controller/Venue.controller';
// import {swapContentController, updateContentOrderController, addContentController ,editContentController, deleteContentController, editContentVisibilityController} from '../controller/Content.controller';
// import { getTrendAndRegionController, getUserPlatformForVenueController, getAdvLogSummaryController, getContentLogAnalyticsController } from '../controller/Analysis.controller';
// import { get } from 'http';

const router = express.Router();

// // utility or user, place the function to user.controller.ts
// const storage = multer.memoryStorage();
// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
//     fileFilter: (req , file, cb: FileFilterCallback) => {
//         if (file.mimetype.startsWith('image/')) {
//             cb(null, true);
//         } else {
//             cb(new Error('Only images are allowed'));
//         }
//     },
// });

// router.post('/image/upload', upload.single('image'), authenticateJWT, uploadImageController)

// // OLD router.get('/info', authenticateJWT, getUserInfo);
// router.get('/user/info', authenticateJWT, getUserInfoController);

// // for account to manage their followers list/add/delete
// router.post('/user/follower/list', authenticateJWT, listFollowerUserController);
// router.post('/user/follower/add', authenticateJWT, addFollowerUserController);
// router.post('/user/follower/delete', authenticateJWT, deleteFollowerUserController);

// // ---------------------------------------------------------------------------------------------------------------------------------------------
// // for adv

// // get the content for a advertiser
// // OLD router.post('/content/advwhole', authenticateJWT, getWholeAdvContent);
// router.get('/advertisement/:adv_id/content/read', authenticateJWT, getWholeAdvContentController);

// // change a advertiser banner or special time
// // OLD router.post('/changeproperty', authenticateJWT, advLevelCacheClear, changeAdvProperty);
// router.post('/advertisement/:adv_id/property/update', authenticateJWT, advLevelCacheClear, changeAdvPropertyController);

// // ---------------------------------------------------------------------------------------------------------------------------------------------
// // for venue

// // get the whole content with accounts visibility
// // OLD router.post('/content/spotwhole', authenticateJWT, getWholeSpotContent);
// router.post('/venue/:venue_id/content/with-visibility/read', authenticateJWT, getWholeSpotContentController);

// // OLD router.post('/spotwholeleafcontentId', authenticateJWT, getWholeSpotContentValidLeafContent);
// router.post('/venue/:venue_id/content/all-leafs/read', authenticateJWT, getWholeSpotContentValidLeafContentController); //用来列出一个venue的所有content用来绑定link_ids的

// // OLD router.post('/checkcontentnamebyIds', authenticateJWT, getContentNamesByIds);
// router.post('/venue/content-names/read', authenticateJWT, getContentNamesByIdsController); //通过content的ids获取content的名字

// // modify a user info
// // OLD router.post('/changeproperty', authenticateJWT, spotLevelCacheClear, changeSpotProperty);
// router.post('/venue/:venue_id/property/update', authenticateJWT, changeSpotPropertyController);

// // ---------------------------------------------------------------------------------------------------------------------------------------------
// // for content

// // swap content sequence, former and latter content id got same parent content id. It's no longer to use, place the function to here, just in case
// router.post('/content/swap', authenticateJWT, contentLevelCacheClear, swapContentController);

// // swap content sequence use this now because of  
// router.post('/content/reorder', authenticateJWT, contentLevelCacheClear, updateContentOrderController);

// // add a content
// router.post('/content/add', authenticateJWT, sanitizeMiddleware, contentLevelCacheClear, addContentController);

// // edit a content
// router.post('/content/edit', authenticateJWT, sanitizeMiddleware, contentLevelCacheClear, editContentController);

// // delete a content
// router.post('/content/delete', authenticateJWT, contentLevelCacheClear, deleteContentController);

// // edit a content visibility
// router.post('/content/visibility', authenticateJWT, contentLevelCacheClear, editContentVisibilityController);

// // ---------------------------------------------------------------------------------------------------------------------------------------------
// // for analysis
// // 这里我就没修改了，反正是单一用途
// // OLD router.post('/getspottrafficandregion', authenticateJWT, getTrendAndRegion);
// router.post('/analysis/venue/read/traffic/and/region', authenticateJWT, getTrendAndRegionController);

// // OLD router.post('/getuserplatformforspot', authenticateJWT, getUserPlatFormForSpot)
// router.post('/analysis/venue/read/device/usage', authenticateJWT, getUserPlatformForVenueController);

// // analytics for advLog
// // OLD router.post('/getadvlogsummary', authenticateJWT, getAdvLogSummary)
// router.post('/analysis/advertisement/log/summary/read', authenticateJWT, getAdvLogSummaryController)

// // analytics for content Log
// // OLD router.post('/getcontentlogsummary', authenticateJWT, getContentLogAnalytics)
// router.post('/analysis/content/log/summary/read', authenticateJWT, getContentLogAnalyticsController)

export default router; 