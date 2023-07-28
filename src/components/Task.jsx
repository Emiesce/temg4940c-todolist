import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import toast from 'react-hot-toast'

// Component for each Task; follows https://codesandbox.io/s/github/react-dnd/react-dnd/tree/gh-pages/examples_js/04-sortable/simple

export const Task = ({ id, text, index, name, moveCard, tasks, setTasks }) => {
  const ref = useRef(null)
  const [{ handlerId }, drop] = useDrop({
    accept: "task",
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },

    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      // Determine mouse position
      const clientOffset = monitor.getClientOffset()
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      // Perform Move Actions
      moveCard(dragIndex, hoverIndex, item)
      item.index = hoverIndex
    },
  })
  const [{ isDragging }, drag] = useDrag({
    type: "task",
    item: () => {
      return { id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

// Function to remove task
const handleRemove = (id) => {
    const filterTasks = tasks.filter(task => task.id !== id)
    localStorage.setItem("tasks", JSON.stringify(filterTasks));
    setTasks(filterTasks)
    toast("Task Removed", { icon: "❌" });
};

// Add Function to edit task, once clicked, allows users to edit the task's name and description
const handleEdit = (id) => {
    const editTask = tasks.map(task => {
        if (task.id === id) {
            // Prompts creates Browser Pop-ups that allows users to enter new name and description
            const name = prompt("Enter new name", task.name) || task.name
            const description = prompt("Enter new description", task.description) || task.description
            return {...task, name: name, description: description}
        } else {
            return task;
        }
    })
    localStorage.setItem("tasks", JSON.stringify(editTask));
    setTasks(editTask)
};

  drag(drop(ref))
  return (
    <div ref={ref} 
        className={`relative p-5 mt-8 shadow-md rounded-md 
                 cursor-grab ${isDragging ? "opacity-0" : "opacity-100"}`} 
        data-handler-id={handlerId}>
        <h1 className="font-bold">{name}</h1>
        <p className="px-3 mt-2">{text}</p>
        <button
            className="absolute bottom-3 right-12 text-slate-400"
            onClick={() => handleEdit(id)}
        > 
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
                stroke-width="1.5" 
                stroke="currentColor" 
                class="w-6 h-6"
                >
                <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" 
                />
            </svg>
        </button>
        <button 
            className="absolute bottom-3 right-3 text-slate-400" 
            onClick={()=> handleRemove(id)}
        >
            <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke-width="1.5" 
            stroke="currentColor" 
            class="w-6 h-6"
            >
                <path 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" 
                />
            </svg>
        </button>
    </div>
  )
}
