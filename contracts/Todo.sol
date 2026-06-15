// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract Todo {
    struct TodoItem {
        string text;
        bool completed;
    }

    TodoItem[] private todos;

    event TodoCreated(uint256 indexed id, string text);
    event TodoToggled(uint256 indexed id, bool completed);
    event TodoDeleted(uint256 indexed id);

    function createTodo(string memory _text) public {
        require(bytes(_text).length > 0, "Todo text cannot be empty");
        todos.push(TodoItem(_text, false));
        emit TodoCreated(todos.length - 1, _text);
    }

    function toggleTodo(uint256 _index) public {
        require(_index < todos.length, "Index out of bounds");
        todos[_index].completed = !todos[_index].completed;
        emit TodoToggled(_index, todos[_index].completed);
    }

    function deleteTodo(uint256 _index) public {
        require(_index < todos.length, "Index out of bounds");
        emit TodoDeleted(_index);
        todos[_index] = todos[todos.length - 1];
        todos.pop();
    }

    function getTodos() public view returns (TodoItem[] memory) {
        return todos;
    }

    function getTodoCount() public view returns (uint256) {
        return todos.length;
    }
}
