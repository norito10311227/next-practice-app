"use client";

import { deleteTask } from "@/actions/task";
import { FaTrashAlt } from "react-icons/fa";
import { FormState } from "@/actions/task";
import { useFormState, useFormStatus } from "react-dom";

interface TaskDeleteButtonProps {
  id: string;
}

const TaskDeleteButton: React.FC<TaskDeleteButtonProps> = ({ id }) => {
  const deleteTaskWithId = deleteTask.bind(null, id);
  const initialState: FormState = { error: "" };
  const [state, formAction] = useFormState(deleteTaskWithId, initialState);

  const SubmitButton = () => {
    const { pending } = useFormStatus();
    return (
      <button
        disabled={pending}
        type="submit"
        className="hover:text-gary-700 text-lg cursor-pointer disabled:bg-gray-400"
      >
        <FaTrashAlt />
      </button>
    );
  };

  return (
    <form action={formAction}>
      <SubmitButton />
      {state.error && <p className="text-red-500 text-sm mt-2">{state.error}</p>}
    </form>
  );
};

export default TaskDeleteButton;
