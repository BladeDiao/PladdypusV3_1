import { Request, Response } from 'express';
import {
    generateCaptcha, 
    storeCaptcha,
    validateCaptcha,
    handleLogin,
    handleForgetPassword,
    validateResetToken,
    resetUserPassword,
    deleteResetToken,
    changeUserPassword,
    redeemAndResetPassword,
    uploadImageService,
    getUserInfoService,
    listFollowersService,
    addFollowerUserService,
    deleteFollowerUserService,
    getUsersListService,
    updateUserCredentialByAdminService
} from '../service/User.service';


export const getCaptcha = async (req: Request, res: Response) => {
    try {
        const { captchaToken, captchaImage, captchaText, timeStamp } = generateCaptcha();

        await storeCaptcha(captchaToken, captchaText, timeStamp);

        res.status(200).json({ captchaToken, captchaImage });
    } catch (error) {
        console.error('Error generating captcha:', error);
        res.status(500).json({ message: 'Error generating captcha' });
    }
};

export const loginProcess = async (req: Request, res: Response) => {
    const { captchaToken, captchaText, email, password } = req.body;

    try {
        await validateCaptcha(captchaToken, captchaText);
        const response = await handleLogin(email, password);

        return res.json(response);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(400).json({ message: errorMessage });
    }
};


//forgot password
export const forgetPasswordProcess = async (req: Request, res: Response) => {
    const { captchaToken, captchaText, email } = req.body;

    try {
        // 1. 验证验证码
        await validateCaptcha(captchaToken, captchaText);

        // 2. 处理忘记密码逻辑
        const response = await handleForgetPassword(email);

        return res.json(response);
    } catch (error) {
        console.error('Forget password error:', error);
        return res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

//reset password
export const resetPasswordProcess = async (req: Request, res: Response) => {
    const { token, email, newPassword } = req.body;

    try {
        // 1. 验证 `token`
        await validateResetToken(token, email);

        // 2. 重置密码
        await resetUserPassword(email, newPassword);

        // 3. 删除 `token`
        await deleteResetToken(token);

        return res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

//change password
export const changePasswordProcess = async (req: Request, res: Response) => {
    const { email, oldPassword, newPassword } = req.body;

    try {
        // 处理修改密码逻辑
        await changeUserPassword(email, oldPassword, newPassword);

        return res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        return res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};


//Redeem account activation

export const redeemAccountProcess = async (req: Request, res: Response) => {
    try {
        const { accountName, email, newPassword, activation_code, captchaToken, captchaText } = req.body;

        const { user, activation } = await redeemAndResetPassword(
            accountName, email, newPassword, activation_code, captchaToken, captchaText
        );

        return res.status(200).json({
            message: 'Account activated successfully!',
            user,
            activation,
        });
    } catch (error) {
        console.error('Error in redeeming account and resetting password:', error);
        return res.status(400).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    }
};

//upload image
export const uploadImageController = async (req: Request, res: Response) => {
    try {
        const { width, height, email } = req.body;
        const parsedWidth = parseInt(width);
        const parsedHeight = parseInt(height);

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const file = req.file as Express.Multer.File;
        const fileUrl = await uploadImageService(
            file.buffer,
            file.originalname,
            parsedWidth,
            parsedHeight,
            email
        );

        // 成功返回
        res.json({
            message: 'File uploaded successfully',
            fileUrl,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error processing image' });
    }
};

//get user info
export const getUserInfoController = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        // 注意: 如果你的前端字段是 `token_email`，这里就要对上

        const { user, roleInfo, roleInfoIdCollection } = await getUserInfoService(email);

        res.status(200).json({ user, roleInfo, roleInfoIdCollection });
    } catch (error) {
        console.error('Error in getUserInfo:', error);
        // 如果是用户不存在的错误，可以单独判断
        if (error instanceof Error && error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
};

//list follower
export const listFollowerUserController = async (req: Request, res: Response) => {
    const { email } = req.body;

    try {
        const managedUsers = await listFollowersService(email);
        return res.status(200).json({ users: managedUsers });
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case 'Insufficient Parameter':
                    return res.status(404).json({ error: 'Insufficient Parameter' });
                case 'Validation error':
                    return res.status(404).json({ error: 'Validation error' });
                case 'Not a master user':
                    return res.status(404).json({ error: 'Not a master user' });
                default:
                    console.error('Error in listFollowerUser:', error);
                    return res.status(500).json({ error: 'Internal server error' });
            }
        }
        return res.status(500).json({ error: 'Unknown error' });
    }
};

//add follower
export const addFollowerUserController = async (req: Request, res: Response) => {
    try {
        const { email, addedEmail, addedAccountName } = req.body;
        const newUser = await addFollowerUserService(email, addedEmail, addedAccountName);

        // 如果 `newUser` 创建成功，返回 200；否则返回 500
        if (newUser) {
            res.status(200).json({ message: `New follower user ${newUser.email} has been created` });
        } else {
            res.status(500).json({ error: 'Failed to create new follower' });
        }

    } catch (error) {
        console.error('Error in addFollowerUserController:', error);

        if (error instanceof Error) {
            switch (error.message) {
                case 'Insufficient Parameter':
                    return res.status(404).json({ error: 'Insufficient Parameter' });
                case 'Validation error':
                    return res.status(404).json({ error: 'Validation error' });
                case 'Not a master user':
                    return res.status(404).json({ error: 'Not a master user' });
                default:
                    return res.status(500).json({ error: 'Internal server error' });
            }
        }
        return res.status(500).json({ error: 'Unknown error' });
    }
};

//delete follower
export const deleteFollowerUserController = async (req: Request, res: Response) => {
    const { email, deletedEmail } = req.body;

    try {
        const pendingDeleteUser = await deleteFollowerUserService(email, deletedEmail);

        res.status(200).json({
            message: `User ${pendingDeleteUser.email} has been removed from system`,
        });
    } catch (error) {
        console.error('Error in deleteFollowerUser:', error);

        if (error instanceof Error) {
            switch (error.message) {
                case 'Insufficient Parameter':
                    return res.status(404).json({ error: 'Insufficient Parameter' });
                case 'Validation error':
                    return res.status(404).json({ error: 'Validation error' });
                case 'No permission to delete':
                    return res.status(404).json({ error: 'No permission to delete' });
                default:
                    return res.status(500).json({ error: 'Internal server error' });
            }
        }
        return res.status(500).json({ error: 'Unknown error' });
    }
};

//get users list
export const getUsersListController = async (req: Request, res: Response): Promise<void> => {
    try {

        const { email } = req.body;

        const userList = await getUsersListService(email);
        res.status(200).json(userList);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', details: error });
    }
};

//update user credential by admin
export const updateUserCredentialByAdminController = async (req: Request, res: Response) => {
    try {
        const { email, userId, updateKey, updateValue } = req.body;

        const result = await updateUserCredentialByAdminService({
            email,
            userId,
            updateKey,
            updateValue,
        });

        return res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
            switch (error.message) {
                case 'Permission denied':
                    return res.status(403).json({ message: 'Permission denied' });
                case 'Cannot find user':
                    return res.status(404).json({ message: 'Cannot find user' });
                case 'Invalid Parameter':
                    return res.status(404).json({ message: 'Invalid Parameter' });
                default:
                    console.error('Error in updateUserCredentialByAdmin:', error);
                    return res.status(500).json({ error: 'Internal server error' });
            }
        }
        // 兜底
        return res.status(500).json({ error: 'Unknown error' });
    }
};