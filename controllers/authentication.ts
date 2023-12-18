import { Response, Request } from "express";
import { Buyer } from "../models/buyer.model";
import { Merchant } from "../models/merchant.model";
const bcrypt = require('bcrypt');

class Authentication {
    static async hashpassword(password: String) {
        try {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt);
            return hashedPassword;
        } catch (error) {
            console.error(error);
        }
    }

    static async createUser(req: Request, res: Response) {
        const {email, password, username, firstName, lastName, phoneNumber, companyName, userType, name} = req.body;
        const profilePictureUrl = 'fghbFJnbKUHxCyjnkmdirukmsIUYYbbkjnkkjh';
        const User = userType === 'Merchant' ? Merchant: Buyer;
        console.log(User);
        if (!email)  {
            res.status(400).json({'Error': 'Missing email'});
            return;
        }
        if (!password) {
            res.status(400).json({'Error': 'Missing password'});
            return;
        }
        if (!username) {
            res.status(400).json({'Error': 'Missing username'});
            return;
        }

        if (!phoneNumber){
            res.status(400).json({'Error': 'Missing last name'});
            return;
        }
        if (userType === Merchant){
            if (!firstName) {
                res.status(400).json({'Error': 'Missing first name'});
                return;
            }
            if (!lastName){
                res.status(400).json({'Error': 'Missing last name'});
                return;
            } 
            if (!companyName) {
                res.status(400).json({'Error': 'Missing Company Name'});
                return;
            }
        }
         if (!profilePictureUrl) {
            res.status(400).json({'Error': 'Missing profile picture'});
            return;
        }
        const hashedPassword = await Authentication.hashpassword(password);
        try {
            if (User === Merchant) {
                const merchant = await (User as typeof Merchant).findOne({ email });
                if (merchant){
                res.status(400).json({'Error': 'Email already exist'});
                return;
                }
                const newUser =  new User({ 
                username,
                firstName,
                lastName,
                email,
                password: hashedPassword,
                profilePicture: profilePictureUrl,
                phoneNumber,
                companyName
            });
            newUser.save();
            res.status(200).json(newUser);
            } else if (User === Buyer) {
                const buyer = await (User as typeof Buyer).findOne({ email });
                if (buyer){
                res.status(400).json({'Error': 'Email already exist'});
                return;
                }
                const newUser =  new User({ 
                    username,
                    name,
                    email,
                    password: hashedPassword,
                    profilePicture: profilePictureUrl,
                    phoneNumber,
                    companyName
                });

                newUser.save();
                res.status(200).json(newUser);
            }
        } catch (error) {
            console.error(error);
            res.status(400).json({'Error': 'Something went wrong'});
        }
        
    }

}

export default Authentication;
