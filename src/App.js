import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [darkMode, setDarkMode] = useState(false); // State for dark mode

  // Fetch tasks from the backend on component mount
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/v1/tasks/')
      .then((response) => {
        setTasks(response.data);
      })
      .catch((error) => {
        console.error('Error fetching tasks:', error);
      });
  }, []);

  // Add a new task
  const addTask = () => {
    if (task.trim() !== '') {
      const newTask = { text: task, completed: false };
      console.log('Sending task:', newTask); // Debug log
      axios.post('http://127.0.0.1:8000/api/v1/tasks/', newTask)
        .then((response) => {
          console.log('Task added:', response.data); // Debug log
          setTasks([...tasks, response.data]);
          setTask('');
        })
        .catch((error) => {
          console.error('Error adding task:', error);
        });
    }
  };

  // Delete a task
  const deleteTask = (id) => {
    axios.delete(`http://127.0.0.1:8000/api/v1/tasks/${id}/`)
      .then(() => {
        setTasks(tasks.filter((t) => t.id !== id));
      })
      .catch((error) => {
        console.error('Error deleting task:', error);
      });
  };

  // Toggle task completion
  const toggleComplete = (id) => {
    const taskToUpdate = tasks.find((t) => t.id === id);
    const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed };

    axios.put(`http://127.0.0.1:8000/api/v1/tasks/${id}/`, updatedTask)
      .then((response) => {
        setTasks(tasks.map((t) => (t.id === id ? response.data : t)));
      })
      .catch((error) => {
        console.error('Error toggling task completion:', error);
      });
  };

  // Start editing a task
  const startEditing = (id, text) => {
    setEditingIndex(id);
    setEditingTaskId(id);
    setTask(text);
  };

  // Save the edited task
  const saveEdit = () => {
    const updatedTask = { text: task, completed: tasks.find((t) => t.id === editingTaskId).completed };

    axios.put(`http://127.0.0.1:8000/api/v1/tasks/${editingTaskId}/`, updatedTask)
      .then((response) => {
        setTasks(tasks.map((t) => (t.id === editingTaskId ? response.data : t)));
        setEditingIndex(null);
        setEditingTaskId(null);
        setTask('');
      })
      .catch((error) => {
        console.error('Error saving edited task:', error);
      });
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`App ${darkMode ? 'dark' : 'light'}`}>
      <header className="App-header">
        <h1>To-Do List</h1>
        <button onClick={toggleDarkMode}>
          {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        </button>
        <div>
          <input
            type="text"
            placeholder="Enter a task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />
          {editingIndex !== null ? (
            <button onClick={saveEdit}>Save</button>
          ) : (
            <button onClick={addTask}>Add Task</button>
          )}
        </div>
        <ul>
          {tasks.map((t) => (
            <li key={t.id} style={{ textDecoration: t.completed ? 'line-through' : 'none' }}>
              {t.text}
              <button onClick={() => toggleComplete(t.id)}>
                {t.completed ? 'Undo' : 'Complete'}
              </button>
              <button onClick={() => startEditing(t.id, t.text)}>Edit</button>
              <button onClick={() => deleteTask(t.id)}>Delete</button>
            </li>
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;