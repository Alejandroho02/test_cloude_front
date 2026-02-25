import { Provider } from 'react-redux';

import { Chat } from './Views/Chat/Chat';
import { store } from './store/store';
import { ToastContainer } from 'react-toastify';


const App: React.FC = () => {

  return (
    <div className="app-container">
      <Provider store={store}>
        <ToastContainer />
        <Chat />
      </Provider>
    </div>
  );
};

export default App;