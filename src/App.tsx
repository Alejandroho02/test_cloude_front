import { Provider } from 'react-redux';

import { Chat } from './Views/Chat/Chat';
import { store } from './store/store';


const App: React.FC = () => {

  return (
    <div className="app-container">
      <Provider store={store}>
        <Chat />
      </Provider>
    </div>
  );
};

export default App;