import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';

const server = express();
server.use(express.json());

server.use(cors());

const participantsList = [];
const messages = [];


server.post('/participants', (req, res) =>{
    const { name } = req.body;

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
        return res.sendStatus(200);
    }
});


server.get('/participants', (req, res) => {
    res.send(participantsList);
});


server.post('/messages', (req, res) => {
    const { to, text, type } = req.body;
    const { user } = req.headers.user;
    if (to === '' || text === '' || type !== 'message' || type !== 'private_message' || participantsList.filter(item => item.name === user) === undefined ){
        return res.sendStatus(400);
    } else {
        messages.push({
            to,
            text,
            type,
            from: user,
            time: dayjs().format('HH:mm:ss')
        });
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
    const updatedList = [];

    participantsList.forEach(item => {
        if ((Date.now() - item.lastStatus) > 10000){
            messages.push({
                from: item.name, 
                to: 'Todos', 
                text: 'sai da sala...', 
                type: 'status', 
                time: dayjs().format('HH:mm:ss')
            })
        } else {
            updatedList.push(item)
        }
    })
    participantsList = updatedList
}, 15000)


server.listen(4000, () => {
    console.log("Servidor rodando na porta 4000")
})