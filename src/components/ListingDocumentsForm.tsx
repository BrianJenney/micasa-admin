import React, { useState, useEffect, FC } from 'react';
import { Form, Input, Button, Space, Select } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';

type FormOptions = {
  label: string;
  value: string;
};

type Document = {
  name: string;
  completed: boolean;
  signatureId: string;
};

type User = {
  address: string;
  email: string;
  firstName: string;
  lastName: string;
  _id: string;
  documents: Document[];
};

export type UserData = User[];

interface ListingDocumentFormProps {
  userData: User[];
}

const ListingDocumentsForm: FC<ListingDocumentFormProps> = ({ userData }) => {
  const [form] = Form.useForm();
  const [documentsToSend, addDocuments] = useState<Array<string>>([]);
  const [userOptions, setuserOptions] = useState<FormOptions[]>([]);
  const [userAddress, setUserAddress] = useState<String>('');
  const [selectedUser, setUser] = useState<User>({
    address: '',
    email: '',
    firstName: '',
    lastName: '',
    _id: '',
    documents: []
  });

  useEffect(() => {
    const transformHouseDataToOptions = (data: User[]) => {
      setuserOptions(
        data.map((datum: User) => ({
          label: `${datum.firstName} ${datum.lastName}`,
          value: datum._id,
          documents: datum.documents
        }))
      );
    };

    transformHouseDataToOptions(userData);
  }, [userData]);

  const documentOptions: FormOptions[] = [
    {
      label: 'Statewide Buyer Seller Advisory',
      value: 'SBSA'
    },
    {
      label: 'Seller Property Questionnaire',
      value: 'SPQ'
    },
    {
      label: 'Transfer Disclosure Agreement',
      value: 'TDS'
    },
    {
      label: 'Water Conserving Carbon Monoxide',
      value: 'WCCM'
    },
    {
      label: 'Water Heater and Smoke Detector',
      value: 'WHSD'
    }
  ];

  const removeDocument = (documentName: string) => {
    const userId = selectedUser._id;
    return axios
      .post('/api/user/graphqlUser', {
        query: `mutation removeDocument ($userId: String!, $documentName: String!) {
              removeDocument (userId: $userId, documentName: $documentName){
                  _id,
                  documents {
                      name,
                      completed,
                      signatureId
                  }
              }
          }`,
        variables: {
          userId,
          documentName
        }
      })
      .then(() => {
        const filteredDocuments: Document[] = selectedUser.documents.filter(
          ({ name }) => name !== documentName
        );
        const updatedUser = { ...selectedUser, documents: filteredDocuments };
        setUser(updatedUser);
      });
  };

  const submitForm = (config: { documents: string[] }) => {
    const { documents } = config;
    const userId = selectedUser._id;
    const address = userAddress.length ? userAddress : selectedUser.address;

    return axios.post('/api/user/graphqlUser', {
      operationName: 'addDocument',
      query: `mutation addDocument ($userId: String!, $address: String!, $documents: [String!]) {
            addDocument (userId: $userId, documents: $documents, address: $address){
                _id,
                documents {
                    name,
                    completed,
                    signatureId
                }
            }
        }`,
      variables: {
        userId,
        documents,
        address
      }
    });
  };

  const handleChange = (val: string) => {
    const selectedUser = userData.find((user: User) => user._id === val);
    if (selectedUser) {
      setUser(selectedUser);
    }
  };

  const updateForm = (val: string) => {
    addDocuments((prev) => [...prev, val]);
  };

  const onFinish = () => {
    if (selectedUser) {
      submitForm({
        documents: documentsToSend
      });

      const updatedDocuments: Document[] = documentsToSend.map((name) => {
        return {
          name,
          signatureId: '',
          completed: false
        };
      });

      const updatedUser = {
        ...selectedUser,
        documents: [...selectedUser.documents, ...updatedDocuments]
      };

      setUser(updatedUser);
    }

    form.resetFields();
  };

  return (
    <div style={{ marginLeft: '1em', width: '50%', margin: 'auto' }}>
      <Form
        form={form}
        name="dynamic_form_nest_item"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="User"
          label="User"
          rules={[{ required: true, message: 'Missing area' }]}
        >
          <Select options={userOptions} onChange={handleChange} />
        </Form.Item>
        {selectedUser.documents.length > 0 && <h2>Sent Documents: </h2>}
        {(selectedUser.documents || []).map((doc) => (
          <>
            <Space key={doc.name} align="baseline" style={{ width: '100%' }}>
              <Form.Item>{doc.name}</Form.Item>
              <Form.Item name="Completed" label="Completed">
                <Input checked={doc.completed} disabled type="checkbox" />
              </Form.Item>
              <MinusCircleOutlined onClick={() => removeDocument(doc.name)} />
            </Space>
          </>
        ))}
        <Form.Item name="UserAddress" label="User Address">
          <Input
            type="text"
            onChange={(e: React.FormEvent<HTMLInputElement>) =>
              setUserAddress(e?.currentTarget?.value)
            }
            value={selectedUser.address}
            placeholder={selectedUser.address}
          />
        </Form.Item>
        <h2>Documents To Send: </h2>
        {selectedUser.firstName.length > 0 && (
          <Form.List name="documentInfo">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space
                    key={field.key}
                    align="baseline"
                    style={{ width: '100%' }}
                  >
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, curValues) =>
                        prevValues.documentInfo.length !==
                        curValues.documentInfo.length
                      }
                    >
                      {() => (
                        <Form.Item {...field} label="Document Name">
                          <Select
                            style={{ width: 200 }}
                            options={documentOptions}
                            onChange={updateForm}
                          />
                        </Form.Item>
                      )}
                    </Form.Item>

                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}

                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Documents
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ListingDocumentsForm;
