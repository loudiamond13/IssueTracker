import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { QueryClient,QueryClientProvider } from 'react-query';
import { AppContextProvider } from './contexts/AppContext.jsx';


const queryClient = new  QueryClient({
  defaultOptions: 
  { 
    queries: 
    {   //prevent from refething 
       retry: 0, // Retry failed requests 0 times before failing permanently
    } 
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppContextProvider>
        <App/>
      </AppContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
