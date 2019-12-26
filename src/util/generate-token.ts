import {createHmac, randomBytes} from 'crypto';
import {salt} from './config';

const token = createHmac('sha256', salt)
	.update(randomBytes(128))
	.digest('hex');

console.log(token);
