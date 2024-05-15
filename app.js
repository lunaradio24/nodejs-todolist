import express from 'express';
import connect from './schemas/index.js';
import todosRouter from './routes/todos.router.js';
import errorHandlerMiddleware from './middlewares/error-handler.middleware.js';

const app = express();
const PORT = 3000;

connect();

// Express에서 req.body에 접근하여 body 데이터를 사용할 수 있도록 설정합니다.
app.use(express.json()); // 미들웨어 1
app.use(express.urlencoded({ extended: true })); // 미들웨어 2

app.use(express.static('./assets')); // 미들웨어 3

// 미들웨어 4
app.use((req, res, next) => {
  console.log(
    'Request URL:',
    req.originalUrl,
    ', METHOD:',
    req.method,
    ', ',
    new Date(),
  );
  next();
});

// 미들웨어 5
app.use('/api', [todosRouter]);

// 에러 처리 미들웨어
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요! - ', new Date());
});
