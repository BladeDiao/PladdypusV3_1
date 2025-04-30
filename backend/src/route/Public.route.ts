import express from 'express'   
// import { getCaptcha, loginProcess, forgetPasswordProcess, resetPasswordProcess, changePasswordProcess, redeemAccountProcess} from '../controller/User.controller';
// import { uploadVenueClick, uploadAdvClick, uploadContentClick} from '../controller/Analysis.controller';
// import { getVenueContent } from '../controller/Content.controller';
// import { getVenueHome, getAllSelectedArticlesByVenueId} from '../controller/Venue.controller';
// import { getAllAdvForVenue } from '../controller/Advertisement.controller';

const router = express.Router();

// // get all contents for a venue
// router.get('/content/:venue_id', getVenueContent);
// // get home page for a venue
// router.get('/home/:venue_id', getVenueHome)
// // get all articles page for a venue
// router.get('/articles/:venue_id', getAllSelectedArticlesByVenueId)
// // get all advertisements page for a venue
// router.get('/advertisements/:venue_id', getAllAdvForVenue)

// // three logs upload for analysis
// router.post('/access/venue', uploadVenueClick);
// router.post('/access/adv',uploadAdvClick);
// router.post('/access/content',uploadContentClick);

// // user login related
// router.get('/user/captcha', getCaptcha);
// router.post('/user/login',loginProcess);
// router.post('/user/password/forget',forgetPasswordProcess);
// router.post('/user/password/reset',resetPasswordProcess);
// router.post('/user/password/change', changePasswordProcess);
// router.post('/user/activation/redeem',redeemAccountProcess);

export default router;