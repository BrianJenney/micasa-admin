import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import ListingDocuments from './components/ListingDocumentsForm';
import { UserData } from './types';

const App: FC = () => {
  const [userData, setUserData] = useState<UserData>([]);
  useEffect(() => {
    const fetchuserData = async () => {
      const response = await axios.post('/api/user/graphqlUser', {
        query: `
        {
          users{
              _id
              address
              county
              parcel
              lastName
              firstName
              email
              buyers {
                _id
                name
                counterOffers {
                  name
                  signatureId
                  counterOfferId
                  completed
                }
                supportingDocuments {
                  name
                }
              }
              documents {
                name
                completed
              }
              documents {
                name
              }

            }
          }
      `,
        variables: null
      });

      setUserData(response.data.data.users);
    };

    fetchuserData();
  }, []);

  return (
    <div style={{ margin: '1em' }}>
      <h1 style={{ textAlign: 'center' }}>Micasa Admin</h1>
      <ListingDocuments userData={userData} />
    </div>
  );
};

export default App;
