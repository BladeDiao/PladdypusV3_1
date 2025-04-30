import { sendMail } from './mailer';

export const resetPasswordEmail = async (url: string, email: string) => {
    const mailSubject = 'Pladdypus Password Reset';
    const resetUrl = url;

    const mailText = `You requested to reset your password. Click the link below to reset your password:\n\n${resetUrl}`;

    const mailHtml = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 800px; margin: 0 auto; background-color: white; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div>
                <img src="https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/email_preconf/reset_password_cover.jpg" 
                     style="max-width: 100%; height: auto; object-fit: cover; display: block;" alt="Password Reset Cover Image" />
            </div>
            <h1 style="color: white; padding: 30px; margin: 0 auto; background-color: #2740FC;">
                <b>Password Reset</b>
            </h1>
            <div style="padding: 20px;">

                <p style="font-size: 16px; color: #333;">If you've lost your password or wish to reset it, use the link below to get started.</p>
                <a href="${resetUrl}" style="background-color: #2740FC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; margin: 20px 0; display: inline-block;">RESET PASSWORD</a>
                <p style="font-size: 14px; color: #666; margin-top: 20px;">If you did not request a password reset, you can safely ignore this email.</p>
                <p style="font-size: 14px; color: #666;">Only a person with access to your email can reset your account password.</p>
            </div>
        </div>
    </div>`;



    await sendMail(
        email,
        mailSubject,
        mailText,
        mailHtml
    );

};

export const followerUserActivation = async (url: string, email: string) => {
    const mailSubject = 'Welcome to Pladdypus!';
    const activationUrl = url;

    const mailText = `Thank you for signing up! Click the link below to activate your account:

${activationUrl}`;

    const mailHtml = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 800px; margin: 0 auto; background-color: white; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div>
                <img src="https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/email_preconf/reset_password_cover.jpg" 
                     style="max-width: 100%; height: auto; object-fit: cover; display: block;" alt="Welcome Cover Image" />
            </div>
            <h1 style="color: white; padding: 30px; margin: 0 auto; background-color: #2740FC;">
                <b>Welcome to Pladdypus!</b>
            </h1>
            <div style="padding: 20px;">
                <p style="font-size: 16px; color: #333;">Thank you for joining us! Click the link below to activate your account and get started:</p>
                <a href="${activationUrl}" style="background-color: #2740FC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px; margin: 20px 0; display: inline-block;">ACTIVATE ACCOUNT</a>
                <p style="font-size: 14px; color: #666; margin-top: 20px;">If you did not sign up for Pladdypus, please ignore this email.</p>
            </div>
        </div>
    </div>`;

    await sendMail(
        email,
        mailSubject,
        mailText,
        mailHtml
    );
};

export const followerUserDeletion = async (email: string) => {
    const mailSubject = 'Your Pladdypus Account Has Been Deleted';

    const mailText = `Your account has been successfully deleted. We're sorry to see you go. If this was a mistake, please contact our support team.`;

    const mailHtml = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 800px; margin: 0 auto; background-color: white; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div>
                <img src="https://pladdypusv2.s3.ap-southeast-2.amazonaws.com/public/email_preconf/reset_password_cover.jpg" 
                     style="max-width: 100%; height: auto; object-fit: cover; display: block;" alt="Goodbye Cover Image" />
            </div>
            <h1 style="color: white; padding: 30px; margin: 0 auto; background-color: #2740FC;">
                <b>Account Deleted</b>
            </h1>
            <div style="padding: 20px;">
                <p style="font-size: 16px; color: #333;">Your account has been successfully deleted. We're sorry to see you go. If this was a mistake, please contact our support team.</p>
                <p style="font-size: 14px; color: #666; margin-top: 20px;">Thank you for being part of Pladdypus. We hope to see you again in the future!</p>
            </div>
        </div>
    </div>`;

    await sendMail(
        email,
        mailSubject,
        mailText,
        mailHtml
    );
};

export const sendNonexistentNewUserVenueActivationEmail = async (
    receiveEmailAddress: string,
    accountName: string,
    newVenueName: string,
    activationUrl: string
): Promise<void> => {
    const subject = 'Your Account Activation Information';
    const text = `Dear ${accountName},
  
  Your account has been created successfully.
  Account Details:
  Email: ${receiveEmailAddress}
  Account Name: ${accountName}
  New Venue: ${newVenueName}
  
  Please activate your account using the following link. This link will allow you to create a new password while redeeming your account.
  It will expire in 48 hours. Do NOT share the link.
  
  Activation Link: ${activationUrl}
  
  Thank you for joining us!`;

    const html = `
      <h2>Welcome to Digital Compendium!</h2>
      <p>Dear ${accountName},</p>
      <p>Your account has been created successfully. Here are your account details:</p>
      <ul>
        <li><strong>Email:</strong> ${receiveEmailAddress}</li>
        <li><strong>Account Name:</strong> ${accountName}</li>
        <li><strong>Your new venue is set up:</strong> ${newVenueName}</li>
      </ul>
      <p>Please use the activation link below to activate your account. We recommend changing your password after the first login.</p>
      <p>Activation Link: <a href="${activationUrl}">${activationUrl}</a></p>
      <p>Thank you for joining us!</p>
    `;

    await sendMail(receiveEmailAddress, subject, text, html);
};

//send email to account owner when a new venue is added
export const sendExistingUserVenueAddedEmail = async (
    receiveEmailAddress: string,
    accountName: string,
    newAddedVenueName: string
): Promise<void> => {
    const subject = 'Your Account Activation Information';
    const text = `Dear ${accountName},
  
  A new venue has been added to your account successfully.
  Account Details:
  Email: ${receiveEmailAddress}
  Account Name: ${accountName}
  New Venue: ${newAddedVenueName}
  
  Thank you for choosing our services!`;

    const html = `
      <h2>Thank you for choosing Digital Compendium again!</h2>
      <p>Dear ${accountName},</p>
      <p>A new venue has been added to your account successfully. Here are your account and new venue details:</p>
      <ul>
        <li><strong>Email:</strong> ${receiveEmailAddress}</li>
        <li><strong>Account Name:</strong> ${accountName}</li>
        <li><strong>Your new added venue is already set up:</strong> ${newAddedVenueName}</li>
      </ul>
      <p>Thank you for choosing our services!</p>
    `;

    await sendMail(receiveEmailAddress, subject, text, html);
};


/**
 * 发送给“新广告主”邮件
 */
export const sendNonexistentNewUserAdvertisementActivationEmail = async (
    email: string,
    accountName: string,
    newAdvertismentName: string,
    activationUrl: string
): Promise<void> => {
    const subject = 'Your Account Activation Information';
    const text = `Dear ${accountName},
  
  Your account has been created successfully.
  
  Account Details:
  Email: ${email}
  Account Name: ${accountName}
  New Advertisement: ${newAdvertismentName}
  
  Please activate your account with the link below. For privacy, this link will allow you to set a new password. It will expire in 48 hours. Do not share the link.
  
  Activation Link: ${activationUrl}
  
  Thank you for joining us!`;

    const html = `
      <h2>Welcome to Digital Compendium !</h2>
      <p>Dear ${accountName},</p>
      <p>Your account has been created successfully. Here are your account details:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Account Name:</strong> ${accountName}</li>
        <li><strong>Your new advertisement is set up:</strong> ${newAdvertismentName}</li>
      </ul>
      <p>Please use the link below to activate your account. We recommend changing your password after the first login. Do NOT share the link; it will expire in 48 hours.</p>
      <p>Activation Link: <a href="${activationUrl}">${activationUrl}</a></p>
      <p>Thank you for joining us!</p>
    `;

    await sendMail(email, subject, text, html);
};

/**
 * 发送给“内部记录邮箱”的邮件, 为了通知新广告主的加入
 */
export const sendAdvertisementRecordEmailForJBG = async (
    recordEmailAddress: string,
    receiveEmailAddress: string,
    accountName: string,
    newAdvertisementName: string,
    newAdvId: string,
    venueDetailsHTML: any
): Promise<void> => {
    const subject = `A new advertiser - ${accountName} has joined Digital Compendium`;
    const text = `${accountName} request to add new advertisement:
  
  Account Details:
  Email: ${receiveEmailAddress}
  Account Name: ${accountName}
  New Advertisement: ${newAdvertisementName}
  New Advertisement ID: ${newAdvId}`;

    const html = `
      <h2>Digital Compendium Record</h2>
      <p>Request Account: ${accountName},</p>
      <p>A new advertisement has been added to ${accountName} successfully. Here are details:</p>
      <ul>
        <li><strong>New Advertisement ID:</strong> ${newAdvId}</li>
        <li><strong>Email:</strong> ${receiveEmailAddress}</li>
        <li><strong>Account Name:</strong> ${accountName}</li>
        <li><strong>New Advertisement:</strong> ${newAdvertisementName}</li>
        <p><strong>Related Spots:</strong></p>
        <ul>
          ${venueDetailsHTML}
        </ul>
      </ul>
    `;

    await sendMail(recordEmailAddress, subject, text, html);
};


/**
 * 给广告主发送“已存在账户下，新增广告”邮件
 */
export const sendAddNewAdvertisementEmailForExistingUser = async (
    email: string,
    accountName: string,
    newAddedAdvertisement: string
): Promise<void> => {
    const subject = 'Your Account Activation Information';
    const text = `Dear ${accountName},
  
  A new advertisement has been added to your account successfully.
  
  Account Details:
  Email: ${email}
  Account Name: ${accountName}
  New Advertisement: ${newAddedAdvertisement}
  
  Thank you for choosing our services!`;

    const html = `
      <h2>Thank you for choosing Digital Compendium again!</h2>
      <p>Dear ${accountName},</p>
      <p>A new advertisement has been added to your account successfully. Here are your account and new advertisement details:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Account Name:</strong> ${accountName}</li>
        <li><strong>Your newly added advertisement:</strong> ${newAddedAdvertisement}</li>
      </ul>
      <p>Thank you for choosing our services!</p>
    `;

    await sendMail(email, subject, text, html);
};

/**
 * 发送内部记录邮件，记录新广告信息
 */
export const sendNewAdvertisementRecordEmailForExistingUser = async (
    recordEmailAddress: string,
    accountName: string,
    receiveEmailAddress: string,
    newAddedAdvertisement: string,
    newAdvId: string,
    venueDetailsListHTML: string
): Promise<void> => {
    const subject = `A new advertiser - ${accountName} has joined Digital Compendium`;
    const text = `${accountName} request to add new advertisement,
  
  Account Details:
  Email: ${receiveEmailAddress}
  Account Name: ${accountName}
  New Advertisement: ${newAddedAdvertisement}
  New Advertisement ID: ${newAdvId}
  `;

    const html = `
      <h2>Digital Compendium Record</h2>
      <p>Request Account: ${accountName},</p>
      <p>A new advertisement has been added to ${accountName} successfully. Here are details:</p>
      <ul>
        <li><strong>New Advertisement ID:</strong> ${newAdvId}</li>
        <li><strong>Email:</strong> ${receiveEmailAddress}</li>
        <li><strong>Account Name:</strong> ${accountName}</li>
        <li><strong>New added advertisement:</strong> ${newAddedAdvertisement}</li>
        <p><strong>Related Spots:</strong></p>
        <ul>
          ${venueDetailsListHTML}
        </ul>
      </ul>
    `;

    await sendMail(recordEmailAddress, subject, text, html);
};

export const sendUserEmailResetNotificationEmail = async (
    receiveEmailAddress: string,
    accountName: string,
    newUserAccountEmail: string,
    websiteUrl: string
): Promise<void> => {

    const subject = 'Account Email Reset Notification - Digital Compendium';
    const text = `Dear ${accountName},
  
  Your account email has been reset successfully.
  
  Account Details:
  - Previous Email: ${receiveEmailAddress}
  - Account Name: ${accountName}
  - New Email: ${newUserAccountEmail}
  
  Please use the new email to login.
  `;

    const html = `
      <h2>Account email updated successfully!</h2>
      <p>Dear ${accountName},</p>
      <p>Your account's email has been updated. Here are your account details:</p>
      <ul>
        <li><strong>New Email:</strong> ${newUserAccountEmail}</li>
        <li><strong>Previous Email:</strong> ${receiveEmailAddress}</li>
        <li><strong>Account Name:</strong> ${accountName}</li>
      </ul>
      <p>Please use the above new email to login Digital Compendium. We recommend changing your password after login.</p>
      <p>Visit our website: <a href="${websiteUrl}">${websiteUrl}</a></p>
      <p>Thanks for your cooperation!</p>
    `;

    // 先给旧邮箱发，再给新邮箱发
    await sendMail(receiveEmailAddress, subject, text, html);
    await sendMail(newUserAccountEmail, subject, text, html);
};

/**
 * 管理员重置用户密码后，通知用户的新密码邮件
 */
export const sendAdminResetPasswordEmail = async (
    email: string,
    accountName: string,
    websiteUrl: string
): Promise<void> => {

    const subject = 'Account Password Reset Notification - Digital Compendium';

    // 注意：默认密码的 placeholder 可能是 `${accountName}!${email}`
    const text = `Dear ${accountName},
  
  Your account password has been reset by an admin.
  
  Account Details:
  - Email: ${email}
  - Account Name: ${accountName}
  - Default Password: ${accountName}!${email}
  
  Please use your new default password to login. We recommend changing your password immediately after logging in.
  
  Visit our website: ${websiteUrl}
  
  Thanks for your cooperation!`;

    const html = `
      <h2>Account Password Update Successfully!</h2>
      <p>Dear ${accountName},</p>
      <p>Your account's password has been reset to a default password. Here are your account details:</p>
      <ul>
        <li><strong>Account Email:</strong> ${email}</li>
        <li><strong>Account Name:</strong> ${accountName}</li>
        <li><strong>Default Password:</strong> ${accountName}!${email}</li>
      </ul>
      <p>Please use the above credentials to login to Digital Compendium. We recommend changing your password immediately after logging in.</p>
      <p>Visit our website: <a href="${websiteUrl}">${websiteUrl}</a></p>
      <p>Thanks for your cooperation!</p>
    `;

    await sendMail(email, subject, text, html);
};