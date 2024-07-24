import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import logo from "./images/logo.png";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const taskInput = useRef(null);

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    const storedCompletedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];
    if (storedTasks) {
      setTasks(storedTasks.split('\n'));
    }
    setCompletedTasks(storedCompletedTasks);
    setUndoStack([storedTasks]);
  }, []);

  const updateLocalStorage = useCallback(() => {
    localStorage.setItem('tasks', tasks.join('\n'));
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
  }, [tasks, completedTasks]);

  useEffect(() => {
    updateLocalStorage();
  }, [tasks, completedTasks, updateLocalStorage]);

  const addTask = () => {
    const taskText = taskInput.current.value.trim();
    if (taskText === "") {
      alert("Please enter a task");
    } else {
      setTasks([...tasks, taskText]);
      setUndoStack([...undoStack, [...tasks, taskText].join('\n')]);
      taskInput.current.value = "";
    }
  };

  const toggleCompleted = (taskText) => {
    if (completedTasks.includes(taskText)) {
      setCompletedTasks(completedTasks.filter(task => task !== taskText));
    } else {
      setCompletedTasks([...completedTasks, taskText]);
    }
  };

  const deleteTask = (taskText) => {
    setTasks(tasks.filter(task => task !== taskText));
  };

  const deleteCompletedTask = (taskText) => {
    setCompletedTasks(completedTasks.filter(task => task !== taskText));
  };

  const deleteAllTasks = () => {
    setTasks([]);
    setUndoStack([...undoStack, ""]);
    setRedoStack([]);
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'z') {
      if (undoStack.length > 1) {
        const lastUndo = undoStack.pop();
        setRedoStack([...redoStack, lastUndo]);
        setTasks(undoStack[undoStack.length - 1].split('\n'));
        setUndoStack(undoStack);
      }
    } else if (e.ctrlKey && e.key === 'y') {
      if (redoStack.length > 0) {
        const lastRedo = redoStack.pop();
        setUndoStack([...undoStack, lastRedo]);
        setTasks(lastRedo.split('\n'));
        setRedoStack(redoStack);
      }
    }
  };

  return (
    <div className="container" onKeyDown={handleKeyDown} tabIndex="0">
      <img src={logo} alt="logo" className="top-left" />
      <div className="Todo-list" id="todoList">
        <h1><i className="fa-solid fa-list"></i> To-Do List</h1>
        <div className="row">
          <input ref={taskInput} type="text" id="taskInput" placeholder="Enter a new task" onKeyDown={(e) => { if (e.key === 'Enter') addTask() }} />
          <button onClick={addTask}>Add Task</button>
        </div>
        <ul id="taskList">
          {tasks.map((task, index) => (
            <li key={index} onClick={() => toggleCompleted(task)} className={completedTasks.includes(task) ? 'completed' : ''}>
              {task}
              <button className="delete-btn" onClick={(e) => { e.stopPropagation(); deleteTask(task); }}>&#x2715;</button>
            </li>
          ))}
        </ul>
        <button className="delete-all-btn" onClick={deleteAllTasks}>Delete All</button>
        <h2>Completed Tasks</h2>
        <ul id="completedTasksList">
          {completedTasks.map((task, index) => (
            <li key={index}>
              {task}
              <button className="delete-btn" onClick={() => deleteCompletedTask(task)}>&#x2715;</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaskManager;
