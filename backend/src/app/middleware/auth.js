import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import * as Yup from 'yup';
import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const shema = Yup.object().shape({
    name: Yup.string(),
    email: Yup.string().email(),
    password: Yup.string(),
  });

  if (!(await shema.isValid(req.body))) {
    return res.status(400).json({ error: 'Validation fails' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
