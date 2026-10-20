import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-cyber-bg">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto">
        <div className="min-h-screen p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
