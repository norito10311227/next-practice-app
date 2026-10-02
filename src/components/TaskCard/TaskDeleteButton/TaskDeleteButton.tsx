import { FaTrash, FaTrashAlt } from "react-icons/fa"

interface TaskDeleteButtonProps {
  id: string
}

const TaskDeleteButton: React.FC<TaskDeleteButtonProps> = ({ id }) => {
  return (
    <form action="">
      <button type="submit" className="hover:text-gary-700 text-lg cursor-pointer">
        <FaTrashAlt />
      </button>
    </form>
  )
}

export default TaskDeleteButton