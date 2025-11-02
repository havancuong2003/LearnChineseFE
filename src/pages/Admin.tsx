import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { Navigate } from 'react-router-dom';

const Admin = () => {
  const { user } = useAuth();
  const [fileType, setFileType] = useState<'vocabulary' | 'reading-units'>('vocabulary');
  const [mode, setMode] = useState<'overwrite' | 'append'>('append');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  const { data: logs } = useQuery({
    queryKey: ['import-logs'],
    queryFn: async () => {
      const response = await api.get('/admin/import-logs');
      return response.data;
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      alert('Vui lòng chọn file');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);
      formData.append('mode', mode);

      const response = await api.post('/admin/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setResult(response.data);
      alert('Import thành công!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Import thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Quản trị - Import Excel</h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Loại file</label>
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as 'vocabulary' | 'reading-units')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="vocabulary">Vocabulary.xlsx</option>
              <option value="reading-units">ReadingUnits.xlsx</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Chế độ import</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as 'overwrite' | 'append')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="append">Ghi tiếp (Append)</option>
              <option value="overwrite">Ghi đè (Overwrite)</option>
            </select>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {mode === 'overwrite'
                ? 'Cảnh báo: Tất cả dữ liệu cũ sẽ bị xóa và thay thế bằng dữ liệu mới'
                : 'Dữ liệu mới sẽ được thêm vào dữ liệu hiện có'}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Chọn file Excel</label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="w-full px-4 py-3 bg-success text-white rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
          >
            {loading ? 'Đang import...' : 'Import'}
          </button>
        </form>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <h3 className="font-semibold mb-2">Kết quả:</h3>
            <div className="text-sm">
              <p>Tổng: {result.result?.total}</p>
              <p className="text-success">Thành công: {result.result?.success}</p>
              <p className="text-error">Thất bại: {result.result?.failed}</p>
              {result.result?.errors && result.result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Lỗi:</p>
                  <ul className="list-disc list-inside">
                    {result.result.errors.slice(0, 10).map((error: string, i: number) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-4">Lịch sử Import</h3>
        <div className="space-y-2">
          {logs?.map((log: any) => (
            <div key={log._id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-semibold">{log.file}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                    ({log.fileType}, {log.mode})
                  </span>
                </div>
                <div className="text-sm">
                  {log.result.success}/{log.result.total} thành công
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(log.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;

