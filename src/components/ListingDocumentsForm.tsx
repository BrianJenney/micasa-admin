import React, { useState, useEffect, FC } from 'react';
import { Form, Input, Button, Select, Upload, Spin, Space } from 'antd';
import { MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { DatePicker } from 'antd';

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

export type CounterOffers = {
  name: string;
  completed: boolean;
  signatureId: string;
  counterOfferId: string;
};

export type Buyer = {
  _id: string;
  name: string;
  counterOffers: CounterOffers[];
};

type User = {
  address: string;
  email: string;
  firstName: string;
  lastName: string;
  _id: string;
  documents: Document[];
  county?: string;
  parcel: string;
  buyers: Buyer[];
};

export type UserData = User[];

interface ListingDocumentFormProps {
  userData: User[];
}

const ListingDocumentsForm: FC<ListingDocumentFormProps> = ({ userData }) => {
  const [form] = Form.useForm();
  const [formType, setFormType] = useState<String>('seller');
  const [processing, setProcessing] = useState<Boolean>(false);
  const [documentsToSend, addDocuments] = useState<Array<string>>([]);
  const [userOptions, setuserOptions] = useState<FormOptions[]>([]);
  const [buyerOptions, setBuyerOptions] = useState<FormOptions[]>([]);
  const [userAddress, setUserAddress] = useState<String>('');
  const [userCounty, setUserCounty] = useState<String>('');
  const [parcel, setParcel] = useState<String>('');
  const [fileList, setFileList] = useState<any[]>([]);
  const [selectedUser, setUser] = useState<User>({
    address: '',
    email: '',
    firstName: '',
    lastName: '',
    _id: '',
    documents: [],
    county: '',
    parcel: '',
    buyers: []
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
      label: 'Seller Property Questionnaire',
      value: 'SPQ'
    },
    {
      label: 'Residential Purchase Agreement',
      value: 'RPA'
    },
    {
      label: 'Buyer Counter Offer',
      value: 'BCO'
    },
    {
      label: 'Repair for Request',
      value: 'RR'
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
        addDocuments([]);
      });
  };

  const clearForm = () => {
    form.resetFields();
    addDocuments([]);
    setFileList([]);
    setProcessing(false);
  };

  const submitForm = async (config: { documents: string[] }) => {
    setProcessing(true);
    const { documents } = config;
    const userId = selectedUser._id;
    const address = userAddress.length ? userAddress : selectedUser.address;
    const county = userCounty.length ? userCounty : selectedUser.county;

    let pdfUrl: string = '';

    if (fileList.length) {
      const formData: FormData = new FormData();
      formData.append('file', fileList[0]);
      const cloudinaryData: any = await axios.post(
        '/api/documents/uploadToCloudinary',
        formData
      );
      pdfUrl = cloudinaryData?.data?.pdfUrl;
    }

    return axios
      .post('/api/user/graphqlUser', {
        operationName: 'addDocument',
        query: `mutation addDocument ($userId: String!, $address: String!, $county: String!, $parcel: String!, $documents: [String!], $pdfUrl: String!) {
            addDocument (userId: $userId, documents: $documents, address: $address, parcel: $parcel, county: $county, pdfUrl: $pdfUrl){
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
          address,
          county,
          parcel,
          pdfUrl
        }
      })
      .then(() => clearForm())
      .catch(() => clearForm());
  };

  const handleChange = (val: string) => {
    const selectedUser = userData.find((user: User) => user._id === val);
    if (selectedUser) {
      setUser(selectedUser);
      const buyerOptions = selectedUser.buyers.map((buyer) => ({
        label: buyer.name,
        value: buyer._id
      }));
      setBuyerOptions(buyerOptions);
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

  const props = {
    onRemove: () => {
      setFileList([]);
    },
    beforeUpload: (file: any) => {
      if (file.type !== 'application/pdf') {
        alert('Contracts must be PDFs');
        return false;
      }
      setFileList([file]);
      return false;
    },
    fileList
  };

  if (processing) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <Spin size="large" />
        <h1>Processing your documents</h1>
      </div>
    );
  }

  return (
    <div style={{ marginLeft: '1em', width: '50%', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
        <p
          style={{
            color: 'blue',
            textDecoration: formType === 'seller' ? 'underline' : 'none'
          }}
          onClick={() => setFormType('seller')}
        >
          Seller
        </p>
        <p
          style={{
            color: 'blue',
            textDecoration: formType === 'buyer' ? 'underline' : 'none'
          }}
          onClick={() => setFormType('buyer')}
        >
          Buyer
        </p>
      </div>
      <Form
        form={form}
        name="dynamic_form_nest_item"
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item
          name="Seller"
          label="Seller"
          rules={[{ required: true, message: 'Missing area' }]}
        >
          <Select options={userOptions} onChange={handleChange} />
        </Form.Item>
        {formType === 'seller' && (
          <>
            {selectedUser.documents.length > 0 && <h2>Sent Documents: </h2>}
            {(selectedUser.documents || []).map((doc) => (
              <>
                <Space
                  key={doc.name}
                  align="baseline"
                  style={{ width: '100%' }}
                >
                  <Form.Item>{doc.name}</Form.Item>
                  <Form.Item label="Completed">
                    <Input checked={doc.completed} disabled type="checkbox" />
                  </Form.Item>
                  <MinusCircleOutlined
                    onClick={() => removeDocument(doc.name)}
                  />
                </Space>
              </>
            ))}
            <Form.Item label="Seller Street Address">
              <Input
                type="text"
                onChange={(e: React.FormEvent<HTMLInputElement>) =>
                  setUserAddress(e?.currentTarget?.value)
                }
                value={selectedUser.address}
                placeholder={selectedUser.address}
              />
            </Form.Item>

            <Form.Item name="UserCounty" label="Seller County">
              <Input
                type="text"
                onChange={(e: React.FormEvent<HTMLInputElement>) =>
                  setUserCounty(e?.currentTarget?.value)
                }
                value={selectedUser.county}
                placeholder={selectedUser.county}
              />
            </Form.Item>
            <Form.Item name="Parcel" label="Seller Parcel">
              <Input
                type="text"
                onChange={(e: React.FormEvent<HTMLInputElement>) =>
                  setParcel(e?.currentTarget?.value)
                }
                value={selectedUser.parcel}
                placeholder={selectedUser.parcel}
              />
            </Form.Item>
          </>
        )}
        {formType === 'buyer' && (
          <Form.Item
            name="Buyer"
            label="Buyer"
            rules={[{ required: true, message: 'Missing area' }]}
          >
            <Select options={buyerOptions} onChange={() => {}} />
          </Form.Item>
        )}
        <h2>Documents To Send: </h2>
        {selectedUser.firstName.length > 0 && (
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, curValues) =>
              prevValues.documentInfo.length !== curValues.documentInfo.length
            }
          >
            <Form.Item label="Document Name">
              <Select
                style={{ width: 200 }}
                options={documentOptions}
                onChange={updateForm}
              />
              <Upload {...props}>
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
            </Form.Item>
            <Form.Item label="Expiration For Counter Offer">
              <DatePicker size="large" />
            </Form.Item>
          </Form.Item>
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
