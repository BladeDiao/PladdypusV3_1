import { createCanvas } from 'canvas';
import crypto from 'crypto';
import redisClients from '../config/redis.config';
import { randomBytes } from 'crypto';
import User from '../model/User.model';
import Venue from '../model/Venue.model';
import Adv from '../model/Adv.model';
import Activation from '../model/Activation.model';
import bcrypt from 'bcryptjs';
import { resetPasswordEmail, followerUserActivation, followerUserDeletion } from '../mail/emailSender';
import { generateId } from '../middleware/IdGenerator.middleware';
import sharp from 'sharp';
import AWS from 'aws-sdk';
import { Op } from 'sequelize';
import UserAssignment from '../model/UserAssignment';

const captchaCache = redisClients.captchaCache;
const tokenCache = redisClients.tokenCache;
const activationCache = redisClients.activationCache;

// Captcha generation
export const generateCaptcha = () => {
  const width = 120;
  const height = 40;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 背景颜色
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, width, height);

  // 添加背景噪点
  for (let i = 0; i < 100; i++) {
    ctx.fillStyle = getRandomColor();
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2, true);
    ctx.fill();
  }

  // 添加干扰线条
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = getRandomColor();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  // 生成随机验证码
  const captchaText = randomString(4);
  ctx.font = '24px sans-serif';
  ctx.fillStyle = '#000';

  let x = 15;
  const y = 25;

  for (let i = 0; i < 4; i++) {
    const rotation = (Math.random() * 60 - 30) * (Math.PI / 180);
    const xOffset = Math.random() * 10 - 5;
    const yOffset = Math.random() * 10 - 5;

    ctx.save();
    ctx.translate(x + xOffset, y + yOffset);
    ctx.rotate(rotation);
    ctx.fillText(captchaText[i], 0, 0);
    ctx.restore();

    x += 25;
  }

  const captchaToken = crypto.randomBytes(16).toString('hex');
  const timeStamp = Date.now();

  return { captchaToken, captchaImage: canvas.toDataURL(), captchaText, timeStamp };
};

export const storeCaptcha = async (captchaToken: string, captchaText: string, timeStamp: number) => {
  const captchaDict = {
    text: captchaText,
    expireTime: timeStamp + 1 * 60 * 60 * 1000 // 1小时过期
  };

  await captchaCache.set(captchaToken, JSON.stringify(captchaDict), 'EX', 3600);
};

function randomString(length: number): string {
  const charset = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    result += charset.charAt(randomIndex);
  }
  return result;
}

function getRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


// User authentication

export const validateCaptcha = async (captchaToken: string, captchaText: string) => {
  const cachedCaptcha = await captchaCache.get(captchaToken);

  if (!cachedCaptcha) {
    throw new Error('Captcha token has expired');
  }

  const captchaDict = JSON.parse(cachedCaptcha);
  if (captchaDict.text !== captchaText) {
    throw new Error('Captcha text is incorrect');
  }
};

export const authenticateUser = async (email: string, password: string) => {
  const user = await User.findOne({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Incorrect email or password');
  }

  return user;
};

export const storeAuthToken = async (authToken: string, userEmail: string) => {
  await tokenCache.set(authToken, userEmail, 'EX', 24 * 60 * 60); // 24小时过期
};

export const handleLogin = async (email: string, password: string) => {
  const user = await authenticateUser(email, password);
  const authToken = randomBytes(16).toString('hex');

  if (user.managedBy) {
    const masterUser = await User.findByPk(user.managedBy);
    if (!masterUser) {
      throw new Error('Follower user does not have master, refuse login');
    }
    await storeAuthToken(authToken, masterUser.email);
    return { message: 'Follower Login successful', user: masterUser.email, token: authToken };
  } else {
    await storeAuthToken(authToken, user.email);
    return { message: 'Master Login successful', user: user.email, token: authToken };
  }
};

//forgot password

export const handleForgetPassword = async (email: string) => {
  const authToken = randomBytes(16).toString('hex');

  // 存储 `authToken` 到 Redis，过期时间 24 小时
  await tokenCache.set(authToken, email, 'EX', 24 * 60 * 60);

  // 生成重置密码链接
  const resetUrl = `${process.env.RESET_PASSWORD_URL}?token=${authToken}&email=${email}`;

  // 发送重置密码邮件
  await resetPasswordEmail(resetUrl, email);

  return { message: 'Reset link successfully sent to email' };
};

//reset password
export const validateResetToken = async (token: string, email: string) => {
  const cachedEmail = await tokenCache.get(token);

  if (!cachedEmail) {
    throw new Error('Invalid or expired token');
  }

  if (cachedEmail !== email) {
    throw new Error('Invalid token for the given email');
  }
};

export const resetUserPassword = async (email: string, newPassword: string) => {
  // 查找用户
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error('Cannot find user');
  }

  // 更新用户密码
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  return user;
};

export const deleteResetToken = async (token: string) => {
  await tokenCache.del(token);
};

//change password
export const changeUserPassword = async (email: string, oldPassword: string, newPassword: string) => {
  // 查找用户
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new Error('Cannot find user');
  }

  // 验证旧密码
  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid old password');
  }

  // 更新用户密码
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  return user;
};

//Redeem account activation
export const redeemAndResetPassword = async (
  accountName: string,
  email: string,
  newPassword: string,
  activationCode: string,
  captchaToken: string,
  captchaText: string
) => {
  // 1. 验证验证码
  const cachedCaptcha = await captchaCache.get(captchaToken);
  if (!cachedCaptcha) throw new Error('Captcha token has expired');

  const captchaDict = JSON.parse(cachedCaptcha);
  if (captchaDict.text !== captchaText) throw new Error('Captcha text is incorrect');

  // 2. 查找用户
  const user = await User.findOne({ where: { email, accountName } });
  if (!user) throw new Error('User does not exist!');

  // 3. 检查用户激活状态
  const activation = await Activation.findOne({
    where: { user_id: user.id },
    order: [['createdTimestamp', 'ASC']],
  });

  if (!activation) throw new Error('No activation record found');
  if (activation.redeemedTimestamp) throw new Error('The account has already been activated');

  // 4. 验证激活码
  const storedActivationCode = await activationCache.get(user.id);
  if (!storedActivationCode) throw new Error('Your activation code has expired');
  if (storedActivationCode !== activationCode) throw new Error('Your activation code is not correct');

  // 5. 重置密码并激活账户
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  await activation.update({ redeemedTimestamp: new Date() });

  return { user, activation };
};

//upload image
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

//处理图片上传、压缩、并上传到 S3
export const uploadImageService = async (
  fileBuffer: Buffer,
  fileOriginalName: string,
  width: number,
  height: number,
  email: string
) => {
  // 1. 查找用户
  console.log(">>> email about to query User: ", email);
  const user = await User.findOne({ where: { email: email } });
  if (!user) {
    throw new Error('User not found');
  }

  // 2. 使用 sharp 压缩/裁剪
  const resizedImageBuffer = await sharp(fileBuffer)
    .resize(width, height, { fit: sharp.fit.cover })
    .png()
    .toBuffer();

  // 3. 上传到 S3
  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: `${user.S3Id}/${Date.now().toString()}_${fileOriginalName}`,
    Body: resizedImageBuffer,
    ContentType: 'image/png',
    CacheControl: 'max-age=31536000', // 缓存 1 年
    Expires: new Date(Date.now() + 31536000000),
  };

  return new Promise<string>((resolve, reject) => {
    s3.upload(params, (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
      if (err) {
        return reject(err);
      }
      // data.Location 为文件的 S3 访问地址
      resolve(data.Location);
    });
  });
};

//get user info
export const getUserInfoService = async (email: string) => {
  // 1. 查找用户
  const user = await User.findOne({
    where: { email },
    attributes: ['id', 'email', 'alias', 'S3Id', 'permissionLevel']
  });
  if (!user) {
    throw new Error('User not found');
  }

  // 2. 查找该用户的所有 assignment
  const assignments = await UserAssignment.findAll({
    where: { user_id: user.id },
    attributes: ['target_id', 'targetType']
  });

  // 3. 按类型收集 target_id
  const venueIds: string[] = [];
  const advIds: string[] = [];
  const touchscreenIds: string[] = [];

  assignments.forEach((a: { targetType: any; target_id: string; }) => {
    switch (a.targetType) {
      case 'venue':
        venueIds.push(a.target_id);
        break;
      case 'adv':
        advIds.push(a.target_id);
        break;
      case 'touchscreen':
        touchscreenIds.push(a.target_id);
        break;
    }
  });

  // 4. 批量查询对应资源
  const venue = venueIds.length
    ? await Venue.findAll({
      where: { id: { [Op.in]: venueIds } },
      attributes: ['id', 'area_id', 'name', 'alias', 'permissionLevel']
    })
    : [];

  const adv = advIds.length
    ? await Adv.findAll({
      where: { id: { [Op.in]: advIds } },
      attributes: ['id', 'area_id', 'name', 'alias', 'permissionLevel']
    })
    : [];

  // 如有 Touchscreen 模型，可按下面示例解开注释：
  // const touchscreen = touchscreenIds.length
  //   ? await Touchscreen.findAll({
  //       where: { id: { [Op.in]: touchscreenIds } },
  //       attributes: { exclude: ['createdAt', 'updatedAt'] }
  //     })
  //   : [];
  const touchscreen: any[] = []; // 如果暂不支持，可返回空数组

  // 5. 组装返回值
  const roleInfo = { venue, adv, touchscreen };
  const roleInfoIdCollection = {
    venue: venue.map(v => v.id),
    adv: adv.map(v => v.id),
    touchscreen: touchscreen.map(t => t.id)
  };

  return { user, roleInfo, roleInfoIdCollection };
};

//list follower
export const listFollowersService = async (email: string) => {
  if (!email) throw new Error('Insufficient Parameter');

  const master = await User.findOne({ where: { email } });
  if (!master) throw new Error('User not found');
  if (master.managedBy) throw new Error('Not a master user');

  // 查所有追随者
  const followers = await User.findAll({
    where: { managedBy: master.id },
    attributes: ['id', 'email', 'accountName']
  });

  const followerIds = followers.map(f => f.id);
  if (!followerIds.length) return [];

  // 拉出所有 venue 分配
  const assigns = await UserAssignment.findAll({
    where: {
      user_id: { [Op.in]: followerIds },
      targetType: 'venue'
    },
    attributes: ['user_id', 'target_id', 'permission_ids']
  });

  // 分组
  const map: Record<string, { venueId: string, permissionIds: number[] }[]> = {};
  assigns.forEach(a => {
    if (!map[a.user_id]) map[a.user_id] = [];
    map[a.user_id].push({
      venueId: a.target_id,
      permissionIds: a.permission_ids
    });
  });

  // 组装返回
  return followers.map(f => ({
    email: f.email,
    accountName: f.accountName,
    assignments: map[f.id] || []
  }));
};

const ensureVenueIdsAllowed = (
  assignments: { venueId: string; permissionIds: number[] }[],
  allowedVenueIds: string[]
) => {
  const bad = assignments
    .map(a => a.venueId)
    .filter(id => !allowedVenueIds.includes(id));
  if (bad.length) {
    throw new Error(`No permission to assign one or more venues: ${bad.join(', ')}`);
  }
}

//add follower
export const addFollowerUserService = async (
  email: string,
  followerEmail: string,
  followerAccountName: string,
  assignments: { venueId: string; permissionIds: number[] }[]
) => {
  if (!email || !followerEmail || !followerAccountName || !assignments) {
    throw new Error('Insufficient Parameter');
  }

  // 校验主用户
  const master = await User.findOne({ where: { email } });
  if (!master) throw new Error('User not found');
  if (master.managedBy) throw new Error('Not a master user');

    // **只能分配主用户已有的 venue**
    const masterAssigns = await UserAssignment.findAll({
      where: { user_id: master.id },
      attributes: ['target_id']
    });
    const allowedVenueIds = masterAssigns.map(a => a.target_id);
    ensureVenueIdsAllowed(assignments, allowedVenueIds);

  // 创建追随者
  const userTmp: User | any = {
    id: generateId('user'),
    email: followerEmail,
    password: '',
    accountName: followerAccountName,
    S3Id: generateId('userS3'),
    permissionLevel: 0,
    managedBy: master.id
  }
  const newUser = await User.create(userTmp);

  // 创建 venue 分配
  const records: UserAssignment | any = assignments.map(a => ({
    user_id: newUser.id,
    targetType: 'venue',
    target_id: a.venueId,
    permission_ids: a.permissionIds
  }));
  await UserAssignment.bulkCreate(records);

  // 发激活邮件
  const authToken = randomBytes(16).toString('hex');
  await tokenCache.set(authToken, followerEmail, 'EX', 24 * 60 * 60);
  const resetUrl = `${process.env.RESET_PASSWORD_URL}?token=${authToken}&email=${followerEmail}`;
  await followerUserActivation(resetUrl, followerEmail);

  return {
    email: newUser.email,
    accountName: newUser.accountName,
    assignments
  };
};

//edit follower
export const editFollowerAssignmentsService = async (
  email: string,
  followerEmail: string,
  assignments: { venueId: string; permissionIds: number[] }[]
) => {
  if (!email || !followerEmail || !assignments) {
    throw new Error('Insufficient Parameter');
  }

  const master = await User.findOne({ where: { email } });
  if (!master) throw new Error('User not found');
  if (master.managedBy) throw new Error('Not a master user');

    // **只能分配主用户已有的 venue**
    const masterAssigns = await UserAssignment.findAll({
      where: { user_id: master.id },
      attributes: ['target_id']
    });
    const allowedVenueIds = masterAssigns.map(a => a.target_id);
    ensureVenueIdsAllowed(assignments, allowedVenueIds);

  const follower = await User.findOne({ where: { email: followerEmail } });
  if (!follower) throw new Error('Follower user not found');
  if (follower.managedBy !== master.id) throw new Error('No permission to edit');

  // 删除旧分配
  await UserAssignment.destroy({
    where: { user_id: follower.id, targetType: 'venue' }
  });

  // 重新写入
  const records: UserAssignment | any = assignments.map(a => ({
    user_id: follower.id,
    targetType: 'venue',
    target_id: a.venueId,
    permission_ids: a.permissionIds
  }));
  await UserAssignment.bulkCreate(records);

  return { message: 'Assignments updated' };
};

//delete follower
export const deleteFollowerUserService = async (
  email: string,
  followerEmail: string
) => {
  if (!email || !followerEmail) throw new Error('Insufficient Parameter');

  const master = await User.findOne({ where: { email } });
  if (!master) throw new Error('Validation error');

  const follower = await User.findOne({ where: { email: followerEmail } });
  if (!follower) throw new Error('Validation error');
  if (follower.managedBy !== master.id) throw new Error('No permission to delete');

  // 先删 assignment
  await UserAssignment.destroy({
    where: { user_id: follower.id }
  });

  // 再删用户
  await User.destroy({ where: { id: follower.id } });

  await followerUserDeletion(followerEmail);

  return follower;
};

//get users list
export const getUsersListService = async (email: string) => {
  // 1. 查询数据库
  const users = await User.findAll({
    attributes: ['id', 'accountName', 'permissionLevel', 'managedBy'],
  });

  // 2. 处理数据格式
  const userList = users
    .filter(user => user.managedBy === null)
    .map(user => ({
      UserId: user.id,
      AccountName: user.accountName || '',
      permissionLevel: user.permissionLevel || 0,
    }));

  return userList;
};

//管理员更新用户凭据
interface UpdateUserCredentialByAdminParams {
  email: string;
  userId: string;
  updateKey: string;
  updateValue: string;
}

export const updateUserCredentialByAdminService = async (params: UpdateUserCredentialByAdminParams) => {
  const { userId, updateKey, updateValue } = params;

  // 2. 查找目标用户
  const user = await User.findOne({ where: { id: userId } });
  if (!user) {
    throw new Error('Cannot find user');
  }

  // 3. 根据 updateKey 更新不同字段
  if (updateKey === 'email') {
    user.email = updateValue;
    await user.save();
    return { message: 'User email has been updated' };
  } else if (updateKey === 'password') {
    // 重置密码
    const defaultPassword = `${user.accountName}!${user.email}`;
    const hashedDefaultPassword = await bcrypt.hash(defaultPassword, 10);
    user.password = hashedDefaultPassword;
    await user.save();
    return { message: 'User password has been updated' };
  } else if (updateKey === 'AccountName') {
    user.accountName = updateValue;
    await user.save();
    return { message: 'User AccountName has been updated' };
  } else {
    throw new Error('Invalid Parameter');
  }
};

