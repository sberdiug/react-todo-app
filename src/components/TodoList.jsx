import React, { useState, useEffect } from 'react';
import './TodoList.css';

const PRIORITY_LEVELS = [
  { id: 1, name: 'Очень низкий', color: '#90EE90' },
  { id: 2, name: 'Низкий', color: '#98FB98' },
  { id: 3, name: 'Средний', color: '#FFD700' },
  { id: 4, name: 'Высокий', color: '#FFA07A' },
  { id: 5, name: 'Очень высокий', color: '#FF6347' }
];

const STORAGE_KEY = 'todo-list-tasks';
const THEME_KEY = 'todo-list-theme';

const TodoList = () => {
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    return savedTodos ? JSON.parse(savedTodos) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed'
  const [selectedPriority, setSelectedPriority] = useState(3); // По умолчанию средний приоритет
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' или 'desc'
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return savedTheme ? JSON.parse(savedTheme) : false;
  });

  // Сохраняем задачи в localStorage при каждом изменении
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, JSON.stringify(isDarkTheme));
    document.body.className = isDarkTheme ? 'dark-theme' : 'light-theme';
  }, [isDarkTheme]);

  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      setTodos([...todos, {
        id: Date.now(),
        text: inputValue,
        completed: false,
        priority: selectedPriority
      }]);
      setInputValue('');
    }
  };

  const handleToggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handlePriorityChange = (id, newPriority) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, priority: newPriority } : todo
    ));
  };

  const handleEditStart = (id, text) => {
    setEditingId(id);
    setEditValue(text);
  };

  const handleEditSave = (id) => {
    if (editValue.trim() !== '') {
      setTodos(todos.map(todo =>
        todo.id === id ? { ...todo, text: editValue } : todo
      ));
      setEditingId(null);
      setEditValue('');
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const sortedAndFilteredTodos = [...filteredTodos].sort((a, b) => {
    if (sortOrder === 'asc') {
      return a.priority - b.priority;
    }
    return b.priority - a.priority;
  });

  const getFilterButtonClass = (filterType) => {
    return `filter-button ${filter === filterType ? 'active' : ''}`;
  };

  const getPriorityColor = (priorityId) => {
    const priority = PRIORITY_LEVELS.find(p => p.id === priorityId);
    return priority ? priority.color : '#FFD700';
  };

  return (
    <div className={`todo-container ${isDarkTheme ? 'dark' : 'light'}`}>
      <div className="header">
        <h1>Список задач</h1>
        <button
          onClick={toggleTheme}
          className={`theme-toggle ${isDarkTheme ? 'dark' : 'light'}`}
          title={isDarkTheme ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
        >
          {isDarkTheme ? '☀️' : '🌙'}
        </button>
      </div>
      <form onSubmit={handleAddTodo} className="todo-form">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Добавить новую задачу..."
          className="todo-input"
        />
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(Number(e.target.value))}
          className="priority-select"
        >
          {PRIORITY_LEVELS.map(priority => (
            <option key={priority.id} value={priority.id}>
              {priority.name}
            </option>
          ))}
        </select>
        <button type="submit" className="add-button">Добавить</button>
      </form>

      <div className="controls">
        <div className="filter-buttons">
          <button
            className={getFilterButtonClass('all')}
            onClick={() => setFilter('all')}
          >
            Все
          </button>
          <button
            className={getFilterButtonClass('active')}
            onClick={() => setFilter('active')}
          >
            Активные
          </button>
          <button
            className={getFilterButtonClass('completed')}
            onClick={() => setFilter('completed')}
          >
            Выполненные
          </button>
        </div>
        <button
          className={`sort-button ${sortOrder}`}
          onClick={toggleSortOrder}
          title={sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
        >
          Сортировка по приоритету {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
      </div>

      <ul className="todo-list">
        {sortedAndFilteredTodos.map(todo => (
          <li 
            key={todo.id} 
            className={`todo-item ${todo.completed ? 'completed' : ''}`}
            style={{ borderLeft: `4px solid ${getPriorityColor(todo.priority)}` }}
          >
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => handleToggleTodo(todo.id)}
            />
            {editingId === todo.id ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="edit-input"
                  autoFocus
                />
                <div className="edit-buttons">
                  <button
                    onClick={() => handleEditSave(todo.id)}
                    className="save-button"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="cancel-button"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="todo-text">{todo.text}</span>
                <select
                  value={todo.priority}
                  onChange={(e) => handlePriorityChange(todo.id, Number(e.target.value))}
                  className="priority-select"
                >
                  {PRIORITY_LEVELS.map(priority => (
                    <option key={priority.id} value={priority.id}>
                      {priority.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleEditStart(todo.id, todo.text)}
                  className="edit-button"
                >
                  Редактировать
                </button>
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="delete-button"
                >
                  Удалить
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoList; 