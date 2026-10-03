import NewTaskForm from '@/components/NewTaskFrom/NewTaskFrom'

const NewTaskPage = () => {
  return (
    <div className="flex flex-col justify-center py-20">
        <h2 className="text-center text-2xl font-bold">New Task</h2>
        <NewTaskForm></NewTaskForm>
    </div>
  );
};

export default NewTaskPage