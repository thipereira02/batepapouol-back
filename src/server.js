import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';
import { stripHtml } from 'string-strip-html';
import fs from 'fs';

const server = express();
server.use(express.json());

server.use(cors());

let participantsList = [];
let messages = [];

if (fs.existsSync('./src/participantsList.json')){
    participantsList = JSON.parse(fs.readFileSync('./src/participantsList.json'))
}

if (fs.existsSync('./src/messages.json')){
    messages = JSON.parse(fs.readFileSync('./src/messages.json'))
}


server.post('/participants', (req, res) =>{
    let { name } = req.body;
    name = stripHtml(name).result.trim();

    if (!name){
        return res.sendStatus(400);
    } else if (participantsList.filter( item => item.name === name).length>0){
        return res.sendStatus(409);
    } else {
        participantsList.push({
            name,
            lastStatus: Date.now()
        });
        messages.push({
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        });
        fs.writeFileSync('./src/messages.json', JSON.stringify(messages));
        fs.writeFileSync('./src/participantsList.json', JSON.stringify(participantsList));
        return res.sendStatus(200);
    }
});


server.get('/participants', (req, res) => {
    res.send(participantsList);
});


server.post('/messages', (req, res) => {
    let { to, text, type } = req.body;
    let { user } = req.headers.user;

    to = stripHtml(to).trim();
    text = stripHtml(text).trim();
    type = stripHtml(type).trim();
    user = stripHtml(user).trim();

    if (to === '' || text === '' || type !== 'message' || type !== 'private_message' || participantsList.filter(item => item.name === user) === undefined ){
        return res.sendStatus(400);
    } else {
        messages.push({
            from: user,
            to,
            text,
            type,
            time: dayjs().format('HH:mm:ss')
        });
        fs.writeFileSync('./src/messages.json', JSON.stringify(messages));
        return res.sendStatus(200);
    }
});


server.get('/messages', (req, res) => {
    const { limit } = req.query.limit;
    const { user } = req.headers.user;
    const shownMessages = [];

    messages.find(item => {
        if (item.to === user || item.to === 'Todos' || item.from === user){
            shownMessages.push(item);
        }
    });

    if (limit === undefined){
        return res.send(shownMessages);
    } else {
        shownMessages.reverse();
        shownMessages.splice(limit, shownMessages.length-1);
        return res.send(shownMessages);
    }
});


server.post('/status', (req, res) => {
    const { user } = req.headers.user;
    const index = participantsList.findIndex(item => item.name === user);

    if (index === -1){
        return res.sendStatus(400);
    } else {
        participantsList[index].lastStatus = Date.now();
        return res.sendStatus(200);
    }
});


setInterval(() => {
    let updatedList = [];

    participantsList.forEach(item => {
        if ((Date.now() - item.lastStatus) > 10000){
            messages.push({
                from: item.name, 
                to: 'Todos', 
                text: 'sai da sala...', 
                type: 'status', 
                time: dayjs().format('HH:mm:ss')
            });
        } else {
            updatedList.push(item);
        }
    })
    participantsList = updatedList
    fs.writeFileSync('./src/messages.json', JSON.stringify(messages));
    fs.writeFileSync('./src/participantsList.json', JSON.stringify(participantsList));
}, 15000);


server.listen(4000, () => {
    console.log("Servidor rodando na porta 4000")
})