import { useState, useEffect, useCallback } from "react";
import { useDrop } from "react-dnd";
import toast from "react-hot-toast";
import update from 'immutability-helper';
import { Task } from './Task'

// ListTask Componet lists all Task Sections and their respective Tasks
const ListTasks = ({ tasks, setTasks }) => {

    const [todos, setTodos] = useState([])
    const [inProgress, setInProgress] = useState([])
    const [archived, setArchived] = useState([])

    useEffect(() => {
        // Check if tasks is null; if so, set to empty array
        if (tasks) {
            const filterTodos = tasks.filter((task) => task.status === "todo");
            const filterInProgress = tasks.filter((task) => task.status === "in-progress");
            const filterArchived = tasks.filter((task) => task.status === "archived");

            setTodos(filterTodos)
            setInProgress(filterInProgress)
            setArchived(filterArchived)
        }
    }, [tasks]);

    // Array of statuses
    const statuses = ["todo", "in-progress", "archived"]

    return (
        <div className="flex gap-16 pb-20">
        {statuses.map((status, index) => (
            <Section 
                key = {index} 
                status = {status} 
                tasks = {tasks} 
                setTasks = {setTasks}
                todos = {todos} 
                inProgress = {inProgress} 
                archived = {archived}
            />
            ))}
        </div>
    );
};

export default ListTasks;

// Header Component for each Task Section
const Header = ({ text, bg, count }) => {
    return (
    <div className= {`${bg} flex items-center h-12 pl-4 rounded-md uppercase text-sm text-white`}>
        {text}
        <div className="ml-2 bg-white w-5 h-5 text-black rounded-full flex items-center justify-center">
        {count}
        </div>
    </div>
    );
};

// Section Component
const Section = ({ status, tasks, setTasks, todos, inProgress, archived }) => {

    // Function to drop a dragged item into a new section:
    const [{ isOver }, drop] = useDrop(() => ({
        accept: "task",
        drop: (item, monitor) => addItemToSection(item.id, monitor.getItem().index),
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    // Format for Section Header:
    let text = "Todo";
    let bg = "bg-red-500"
    let tasksToMap = todos;

    if (status === "in-progress") {
        text = "In Progress";
        bg = "bg-orange-500"
        tasksToMap = inProgress;
    }

    if (status === "archived") {
        text = "Archived";
        bg = "bg-gray-500"
        tasksToMap = archived;
    }

    // Function to add dropped item to new Section in which I can move a task to any position within a section:
    const addItemToSection = (id, index) => {
        setTasks((prev) => {
            const taskToMove = prev.find((task) => task.id === id);
            const updatedTasks = prev.filter((task) => task.id !== id);
            const targetIndex = index > updatedTasks.length ? updatedTasks.length : index;
            updatedTasks.splice(targetIndex, 0, { ...taskToMove, status });
            localStorage.setItem("tasks", JSON.stringify(updatedTasks));
            toast("Task Moved", { icon: "👍" });
            return updatedTasks;
        });
    };

    // Function to allow Re-Ordering Tasks within a Section
    const moveCard = useCallback((dragIndex, hoverIndex, item) => {
        const sourceIndex = tasks.findIndex((task) => task.id === item.id);
        const sourceTask = tasks[sourceIndex];
        const targetTask = { ...sourceTask, status };
        let updatedTasks;
    
        // Check if the task is being moved within the same section
        if (sourceTask.status === status) {
        updatedTasks = update(tasks, {
            [sourceIndex]: { $set: tasks[hoverIndex] },
            [hoverIndex]: { $set: sourceTask },
        });
        } else {
        // Move task to a new section
        updatedTasks = update(tasks, {
            $splice: [
            [sourceIndex, 1],
            [hoverIndex, 0, targetTask],
            ],
        });
        }
    
        setTasks(updatedTasks);
        localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    
        // Display a toast message if the task is being moved to a different section
        if (sourceTask.status !== status) {
        toast("Task Moved to New Section", { icon: "👍" });
        }
    }, [status, tasks, setTasks]);

    // Return a Wrapper for Header and Task Component
    return (
        <div 
            ref = {drop}
            className={`w-96 ${isOver ? "bg-slate-200 p-5 mt-8 shadow-md rounded-md relative" : ""}`}
        >
            <Header text = {text} bg = {bg} count = {tasksToMap.length} />
            {tasksToMap.length > 0 && tasksToMap.map((task, i) => (
                    <Task
                    key={task.id}
                    index={i}
                    id={task.id}
                    name={task.name}
                    text={task.description}
                    moveCard={moveCard}
                    tasks={tasks}
                    setTasks={setTasks}
                    handleRemove={() => handleRemove(id)}
                    handleEdit={() => handleEdit(id)}
                />
                )
            )}
        </div>
    );
};
