import express from 'express';
import Todo from '../schemas/todo.schema.js';
import joi from 'joi';

const router = express.Router();

const createdTodoSchema = joi.object({
  value: joi.string().min(1).max(50).required(),
});

/**  할일 등록 API  **/
router.post('/todos', async (req, res, next) => {
  try {
    // 1. 클라이언트로부터 받아온 value 데이터를 가져온다.
    const validation = await createdTodoSchema.validateAsync(req.body);

    const { value } = validation;

    // 1.5 만약 클라이언트가 value 데이터를 전달하지 않았을 때, 클라이언트에게 에러 메시지를 전달한다.
    if (!value) {
      return res
        .status(400)
        .json({ errorMessage: '해야할 일(value) 데이터가 존재하지 않습니다.' });
    }

    // 2. 해당하는 마지막 order 데이터를 조회한다.
    // findOne은 1개의 데이터만 조회한다.
    const todoMaxOrder = await Todo.findOne().sort('-order').exec();

    // 3. 만약 존재한다면 현재 해야 할 일을 + 1 하고, 존재하지 않으면 1로 할당한다.
    const order = todoMaxOrder ? todoMaxOrder.order + 1 : 1;

    // 4. 해야할 일 등록
    const todo = new Todo({ value, order });
    await todo.save();

    // 5. 해야할 일을 클라이언트에게 반환한다.
    return res.status(201).json({ todo: todo });
  } catch (error) {
    // 라우터 다음에 있는 에러 처리 미들웨어를 실행한다.
    next(error);
  }
});

/**  할일 목록 조회 API  **/
router.get('/todos', async (req, res, next) => {
  // 1. 해야할 일 목록 조회를 진행한다.
  const todos = await Todo.find().sort('-order').exec();

  // 2. 해야할 일 목록 조회 결과를 클라이언트에게 반환한다.
  return res.status(200).json({ todos });
});

/**  할일 순서, 내용, 완료여부 변경 API  **/
router.patch('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;
  const { value, order, done } = req.body;

  // 현재 나의 order가 무엇인지 알아야한다.
  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res.status(404).json({ errorMessage: '존재하지 않는 할일입니다.' });
  }

  if (value) {
    currentTodo.value = value;
  }
  if (order) {
    const targetTodo = await Todo.findOne({ order }).exec();
    if (targetTodo) {
      targetTodo.order = currentTodo.order;
      await targetTodo.save();
    }
    currentTodo.order = order;
  }
  if (done !== undefined) {
    currentTodo.doneAt = done ? new Date() : null;
  }

  await currentTodo.save();

  return res.status(200).json({});
});

/**  할일 삭제 API  **/
router.delete('/todos/:todoId', async (req, res, next) => {
  const { todoId } = req.params;
  const currentTodo = await Todo.findById(todoId).exec();
  if (!currentTodo) {
    return res.status(404).json({ errorMessage: '존재하지 않는 할일입니다.' });
  }
  await Todo.deleteOne({ _id: todoId });
  return res.status(200).json({});
});

export default router;
