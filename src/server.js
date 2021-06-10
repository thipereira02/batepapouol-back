import express from 'express';
import cors from 'cors';
import dayjs from 'dayjs';

const server = express();
server.use(express.json());

server.use(cors());

const participantsList = [];
const messages = [];

server.post('/participants', (req, res) =>{
    const { name } = req.body

    if (!name){
        return res.sendStatus(400);
    } else if (participantsList.filter( item => item.name === name).length>0){
        return res.sendStatus(409)
    } else {
        participantsList.push({
            name,
            lastStatus: Date.now()
        })
        messages.push({
            from: name,
            to: 'Todos',
            text: 'entra na sala...',
            type: 'status',
            time: dayjs().format('HH:mm:ss')
        })
        return res.sendStatus(200)
    }
})


server.get('/participants', (req, res) => {
    res.send(participantsList)
})





server.listen(4000, () => {
    console.log("Servidor rodando na porta 4000")
})