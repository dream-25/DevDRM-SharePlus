import FileUpload from '@/components/FileUpload';

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-8">Share Your Files</h1>
        <FileUpload />
      </div>
    </div>
  );
};

export default Index;