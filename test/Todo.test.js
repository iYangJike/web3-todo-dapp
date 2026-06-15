const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Todo", function () {
  let todo;
  let owner;

  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const Todo = await ethers.getContractFactory("Todo");
    todo = await Todo.deploy();
    await todo.waitForDeployment();
  });

  describe("创建 Todo", function () {
    it("应该能创建一个新的 todo", async function () {
      await todo.createTodo("学习 Web3");
      const todos = await todo.getTodos();
      expect(todos.length).to.equal(1);
      expect(todos[0].text).to.equal("学习 Web3");
      expect(todos[0].completed).to.equal(false);
    });

    it("应该能创建多个 todo", async function () {
      await todo.createTodo("学习 Solidity");
      await todo.createTodo("部署合约");
      const todos = await todo.getTodos();
      expect(todos.length).to.equal(2);
    });

    it("创建空文本的 todo 应该失败", async function () {
      await expect(todo.createTodo("")).to.be.revertedWith("Todo text cannot be empty");
    });
  });

  describe("完成 Todo", function () {
    it("应该能把 todo 标记为完成", async function () {
      await todo.createTodo("学习 Hardhat");
      await todo.toggleTodo(0);
      const todos = await todo.getTodos();
      expect(todos[0].completed).to.equal(true);
    });

    it("再次调用应该取消完成状态", async function () {
      await todo.createTodo("写测试");
      await todo.toggleTodo(0);
      await todo.toggleTodo(0);
      const todos = await todo.getTodos();
      expect(todos[0].completed).to.equal(false);
    });
  });

  describe("删除 Todo", function () {
    it("应该能删除 todo", async function () {
      await todo.createTodo("要删除的任务");
      await todo.deleteTodo(0);
      const todos = await todo.getTodos();
      expect(todos.length).to.equal(0);
    });
  });

  describe("事件", function () {
    it("创建 todo 时应该触发 TodoCreated 事件", async function () {
      await expect(todo.createTodo("新任务"))
        .to.emit(todo, "TodoCreated")
        .withArgs(0, "新任务");
    });

    it("切换 todo 时应该触发 TodoToggled 事件", async function () {
      await todo.createTodo("事件测试");
      await expect(todo.toggleTodo(0))
        .to.emit(todo, "TodoToggled")
        .withArgs(0, true);
    });
  });
});
