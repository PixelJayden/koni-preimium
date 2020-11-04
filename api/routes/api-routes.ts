import { Router } from 'express';
import { SavedCommand, CommandDocument } from '../../data/models/command';
import { AuthClient } from '../server';
import * as config from '../../config.json';
import { SavedUser } from '../../data/models/user';

import { router as botsRoutes } from './bots-routes';
import { router as musicRoutes } from './music-routes';
import { router as userRoutes } from './user-routes';

export const router = Router();

let commands: CommandDocument[] = [];
SavedCommand.find().then(cmds => commands = cmds);

router.get('/', (req, res) => res.json({ hello: '' }));

router.get('/commands', async (req, res) => res.json(commands));

router.get('/auth', async (req, res) => {
    try {
        const key = await AuthClient.getAccess(req.query.code);
        res.json(key);
    } catch (error) { sendError(res, 400, error); }
});

router.post('/error', async(req, res) => {
  try {
    const { message } = req.body;

    const key = req.query.key;
    let user = { id: 'N/A' };
    if (key)
      user = AuthClient.getUser(key);
    
    // TODO: log errors here in database or something, if you want
  } catch (error) { sendError(res, 400, error); }
});

router.get('/invite', (req, res) => 
    res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${config.bot.id}&redirect_uri=${config.dashboard.url}/dashboard&permissions=8&scope=bot`));

router.get('/login', (req, res) =>
    res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${config.bot.id}&redirect_uri=${config.dashboard.url}/auth&response_type=code&scope=identify guilds&prompt=none`));

router.use('/bots', botsRoutes);
router.use('/bots/:botId/guilds/:guildId/music', musicRoutes);
router.use('/user', userRoutes);

router.get('*', (req, res) => res.status(404).json({ code: 404 }));

export function sendError(res: any, code: number, error: Error) {
  return res.status(code).json({ code, message: error?.message })
}