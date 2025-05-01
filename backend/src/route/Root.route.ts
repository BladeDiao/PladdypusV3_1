
import express from 'express';
import { authenticateJWT, checkAdminPermissionLevel } from '../middleware/JWT.middleware';
import { advLevelCacheClear, articleLevelCacheClear } from '../middleware/ClearCache.middleware';
// import {
//     getAllAreaOptionsController,
//     getAssociatedArticlesController,
//     updateAssociatedArticlesController,
//     getAssociatedAreasByArticleController,
//     updateAssociatedAreasByArticleController,
//     getAssociatedAdvertisementsController,
//     updateAssociatedAdvertisementsController,
//     getAssociatedAreasByAdvertisementController,
//     updateAssociatedAreasByAdvertisementController,
//     getAssociatedVenuesController,
//     updateAssociatedVenuesController,
// } from '../controller/Area.controller';
// import { rootAuthentication } from '../middleware/RootAuth.middleware';
import { getUsersListController, updateUserCredentialByAdminController} from '../controller/User.controller';
// import { getUserInfoByIdForActivationController, createNewUserWithInfoController, sendNonexistentNewUserVenueActivationEmailController, sendVenueAddedEmailController, sendNonexistentNewUserAdvertisementEmailController, sendNewAdvertToExistedUserController, sendUserNewEmailByAdminController, sendResetPasswordByAdminController} from '../controller/Activation.controller';
// import { getAdvIdsAndNamesController, createNewAdvWithSpotIdsController} from '../controller/Advertisement.controller';

const router = express.Router();

// manage user account related

// get all users list
// OLD router.get('/getuserslist', authenticateJWT, getUsersList);
router.get('/user/list', authenticateJWT, checkAdminPermissionLevel, getUsersListController);

// force to change user's credential
// OLD router.post('/updateusercredentialbyadmin', authenticateJWT, updateusercredentialbyadmin);
router.post('/user/credential/enforce/update', authenticateJWT, checkAdminPermissionLevel, updateUserCredentialByAdminController);


// // ---------------------------------------------------------------------------------------------------------------------------------------------
// // activation related

// // get a user's activation info
// // OLD router.post('/getuserinfobyidforactivation', authenticateJWT, getUserInfoByIdForActivation);
// router.post('/activation/userinfo/read', authenticateJWT, checkAdminPermissionLevel, getUserInfoByIdForActivationController);

// //原来是为了更新用户信息的，现在由于AccountInfoPage已经废弃，所以这个接口暂时搁置或者删除
// // OLD router.post('/updateusercredentialbyprofilepage', authenticateJWT, updateUserCredentialByProfilePage);

// // create a user activation record
// //OLD router.post('/activation/createnewuser', authenticateJWT, CreateNewUserWithInfo)
// router.post('/activation/user/new', authenticateJWT, checkAdminPermissionLevel, createNewUserWithInfoController);

// // email customer about venue/adv creation

// //OLD router.post('/activation/email/venue/newuser', authenticateJWT, async (req: Request, res: Response)
// router.post('/activation/email/venue/nonexistent/new',authenticateJWT, checkAdminPermissionLevel, sendNonexistentNewUserVenueActivationEmailController);

// //OLD router.post('/activation/email/venue/addnew', authenticateJWT, async (req: Request, res: Response)
// router.post('/activation/email/venue/existed/add',authenticateJWT, checkAdminPermissionLevel, sendVenueAddedEmailController);

// //OLD router.post('/activation/email/advertisment/newuser', authenticateJWT, async (req: Request, res: Response)
// router.post('/activation/email/advertisement/nonexistent/new',authenticateJWT, checkAdminPermissionLevel, sendNonexistentNewUserAdvertisementEmailController);

// //OLD router.post('/activation/email/advertisment/addnew', authenticateJWT, async (req: Request, res: Response)
// router.post('/activation/email/advertisement/existed/add', authenticateJWT, checkAdminPermissionLevel, sendNewAdvertToExistedUserController);

// // TODO 这个我理解是整体的resend，而不是只针对adv 存疑
// // router.post('/root/activation/email/advertisement/nonexistent/resend');//OLD router.post('/activation/email/advertisment/newuser/resend', authenticateJWT, async (req: Request, res: Response) 

// // send email to customer when enforce to change email address
// // OLD router.post('/send-user-new-email-by-admin', authenticateJWT, async (req: Request, res: Response) => {
// router.post('/activation/account-email/reset', authenticateJWT, checkAdminPermissionLevel, sendUserNewEmailByAdminController);

// // email customer about password change
// // router.post('/send-reset-password-by-admin', authenticateJWT, async (req: Request, res: Response) => {
// router.post('/activation/email/password/reset', authenticateJWT, checkAdminPermissionLevel,  sendResetPasswordByAdminController);


// // ---------------------------------------------------------------------------------------------------------------------------------------------
// // area related 注意，这里意思是和area使用相关的api不代表起始route一定是area开头
// // adv-venue article-venue的配对需要参考area，但是和area并没有本质关系, 基本所有的api是先从area到其他的article，advertisement，venue，但是api本质是双向的， 所有要求有单独的一个field来区分方向

// router.post('/area/list', authenticateJWT, getAllAreaOptionsController);

// // --- 文章关联 ---
// // 根据区域查文章
// router.post('/area/:area_id/associated-articles/list', authenticateJWT, rootAuthentication, getAssociatedArticlesController);
// // 根据文章查区域（反向）
// router.post('/article/:article_id/associated-areas/list', authenticateJWT, rootAuthentication, getAssociatedAreasByArticleController);
// // 更新区域关联的文章
// router.put('/area/:area_id/associated-articles/update', authenticateJWT, rootAuthentication, updateAssociatedArticlesController);
// // 更新文章关联的区域（反向更新）
// router.put('/article/:article_id/associated-areas/update', authenticateJWT, rootAuthentication, updateAssociatedAreasByArticleController);

// // --- 广告关联 ---
// // 根据区域查广告
// router.post('/area/:area_id/associated-advertisements/list', authenticateJWT, rootAuthentication, getAssociatedAdvertisementsController);
// // 根据广告查区域（反向）
// router.post('/advertisement/:advertisement_id/associated-areas/list', authenticateJWT, rootAuthentication, getAssociatedAreasByAdvertisementController);
// // 更新区域关联的广告
// router.put('/area/:area_id/associated-advertisements/update', authenticateJWT, rootAuthentication, updateAssociatedAdvertisementsController);
// // 更新广告关联的区域（反向更新）
// router.put('/advertisement/:advertisement_id/associated-areas/update', authenticateJWT, rootAuthentication, updateAssociatedAreasByAdvertisementController);



// // Get all selected venues for the area
// router.post('/area/:area_id/associated-venues/list', authenticateJWT, getAssociatedVenuesController);
// // Edit a venue paired area (no s)
// // OLD router.post('/area/spotname/update', authenticateJWT, changeAreaIdWithOrder)
// router.put('/area/:area_id/associated-venues/update', authenticateJWT, updateAssociatedVenuesController);


// // TODO 这个我理解应该是一个附产品？
// // OLD router.post('/area/puclicpoint', authenticateJWT,getSpotPublicPointAndCurrentAreaId)
// // router.post('/root/venue/read/public/root/with/current/area/id', authenticateJWT)


// // ---------------------------------------------------------------------------------------------------------------------------------------------
// // advertisement related

// // get all adversities id and name
// // OLD router.get('/getalladvidandname', authenticateJWT, getAdvIdsAndNames)
// router.get('/advertisement/list', authenticateJWT, checkAdminPermissionLevel, getAdvIdsAndNamesController)

// // create a advertiser
// // OLD router.post('/createnewadvwithspotids', authenticateJWT, advLevelCacheClear, createNewAdvWithSpotIds)
// router.post('/advertisement/new', authenticateJWT, checkAdminPermissionLevel, advLevelCacheClear, createNewAdvWithSpotIdsController)

// // get a advertiser's participate venues
// // OLD router.post('/viewadvpairedspot', authenticateJWT, viewAdvPairedSpot)
// router.post('/advertisement/:adv_id/associated-venues/read', authenticateJWT,)

// // edit a advertiser's participate venues
// // OLD router.post('/editadvwithspotids', authenticateJWT, advLevelCacheClear, editAdvWithSpotIds)
// router.post('/advertisement/:adv_id/associated-venues/update', authenticateJWT, advLevelCacheClear)

// // ---------------------------------------------------------------------------------------------------------------------------------------------
// // article related

// // OLD router.get('/getarticleinfo/:article_id', authenticateJWT, getArticleData);
// router.post('/article/:article_id/read', authenticateJWT);

// // OLD router.post('/updatearticle', authenticateJWT ,articleLevelCacheClear, updateArticleData);
// router.post('/article/:article_id/update', authenticateJWT, articleLevelCacheClear);

// // OLD router.post('/articleidandname', authenticateJWT, get_all_avaliable_articleId_and_locationInfo)
// router.post('/article/list', authenticateJWT,)

// // OLD router.post('/createnewarticle', authenticateJWT, createNewArticle);
// router.post('/article/new', authenticateJWT,);

// // OLD router.post('/avaliablearticlesandselectedarticles', authenticateJWT, articleLevelCacheClear,getAllAvailableArticlesAndSelectedArticles);
// router.post('/article/:article_id/associated-venues/read', authenticateJWT, articleLevelCacheClear);

// // 这是一对共同实现update 一增一减
// // edit a article's participate venues
// // OLD router.post('/linkarticletospot', authenticateJWT ,linkArticlesToSpot);
// router.post('/article/:article_id/associated-venues/update/add', authenticateJWT);
// // OLD router.post('/disconnectarticlewithspot', authenticateJWT, disconnectArticlesWithSpot);
// router.post('/article/:article_id/associated-venues/update/disconnect', authenticateJWT);

// // edit a venue's participating articles master entry
// // OLD router.post('/updatemainarticlewithspotidandarticleid', authenticateJWT, updateArticleMasterEntry);
// router.post('/article/:article_id/entry-article/update', authenticateJWT);

// // 好像已经被废弃了 前端无任何调用
// // OLD router.post('/updatemasterentry', authenticateJWT, updateMasterEntryForArticle);
// // router.post('/article/venue/master/entry/update', authenticateJWT,);


// // ---------------------------------------------------------------------------------------------------------------------------------------------
// // venue related

// // get a venue's participate advertisers
// router.post('/venue/:venue-id/associated-advertisements/read', authenticateJWT,)

// // update spot participate adv ids
// // OLD router.post('/editspotparticipateadvids', authenticateJWT, advLevelCacheClear, updateSpotParticipatedAdvs)
// router.post('/venue/:venue-id/associated-advertisements/update', authenticateJWT, advLevelCacheClear)

// // get a venue's participate articles
// router.post('/venue/:venue-id/associated-articles/read', authenticateJWT,)

// // update venue participate article ids
// router.post('/venue/:venue-id/associated-articles/update', authenticateJWT, advLevelCacheClear)

// // ---------------------------------------------------------------------------------------------------------------------------------------------
// // venue+advertisement+article 存续问题
// // 这里讨论！

export default router; 