import React, { useState, useEffect, FC } from 'react';
import { Form, Input, Button, Select, Upload, Spin, Space } from 'antd';
import { MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { DatePicker } from 'antd';

import axios from 'axios';

export type FormOptions = {
  label: string;
  value: string;
};

type SupportingDocument = {
  name: string;
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
  supportingDocuments: SupportingDocument[];
};

export type User = {
  address?: string;
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

export interface ListingDocumentFormProps {
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
  const [newBuyerName, setNewBuyerName] = useState<string>('');
  const [expirationDate, setDate] = useState<any>(new Date());
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
  const [selectedBuyer, setBuyer] = useState<Buyer>({
    name: '',
    _id: '',
    supportingDocuments: [],
    counterOffers: []
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
      label: 'Statewide Buyer and Seller Advisory',
      value: 'SBSA'
    },
    {
      label: 'Broker/Escrow Relationship Disclosure',
      value: 'BERD'
    },
    {
      label: 'Transfer Disclosure Statement',
      value: 'TDS'
    },
    {
      label: 'Water Conserving Carbon Monoxide',
      value: 'WCCM'
    },
    {
      label: 'Water Heater and Smoke Detector',
      value: 'WHSD'
    },
    {
      label: 'Earthquake Hazard Disclosure',
      value: 'EHD'
    },
    {
      label: 'Earthquare/Environmental Booklet Receipt',
      value: 'EEBR'
    },
    {
      label: 'Lead Based Paint Disclosure',
      value: 'LPD'
    },
    {
      label: 'Market Condition Advisory',
      value: 'MCA'
    },
    {
      label: 'Agent Visual Inspection Disclosure',
      value: 'AVID'
    },
    {
      label: 'Seller Property Questionnaire',
      value: 'SPQ'
    },
    {
      label: 'Residential Purchase Agreement Copy',
      value: 'RPAC'
    },
    {
      label: 'EMD Receipt',
      value: 'EMD'
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
      label: 'Repair Request',
      value: 'RR'
    },
    {
      label: 'Repair Request Counter Offer',
      value: 'RRCO'
    },
    {
      label: 'Proof of Downpayment Funds',
      value: 'PDPF'
    },
    {
      label: 'Escrow Instructions',
      value: 'ESIN'
    },
    {
      label: 'Escrow Holder Acceptance Acknowledgment',
      value: 'EHAA'
    },
    {
      label: 'Natural Hazard Disclosure',
      value: 'NHD'
    },
    {
      label: 'Preliminary Title',
      value: 'PRET'
    },
    {
      label: 'Buyers Approval of HOA & CC&Rs',
      value: 'BAPR'
    },
    {
      label: 'Physical Inspection Contingency Report',
      value: 'PICR'
    },
    {
      label: 'Conditional Loan Approval',
      value: 'CLA'
    },
    {
      label: 'Loan Contingency Removal',
      value: 'LCR'
    },
    {
      label: 'Buyers ESS Wire Receipt',
      value: 'ESS'
    },
    {
      label: 'Verification of Property Condition',
      value: 'VPC'
    },
    {
      label: 'Sellers Estimate Settlement Statement',
      value: 'SESS'
    }
  ];

  const buyerDocs: string[] = [
    'RPA',
    'BCO',
    'RR',
    'RRCO',
    'RPAC',
    'EMD',
    'PICR',
    'CLA',
    'LCR',
    'ESS',
    'PDPF'
  ];

  const createBuyer = () => {
    return axios
      .post('api/buyer/graphqlBuyer', {
        query: `mutation createBuyer($buyerName: String!, $sellerId:String!) {
        createBuyer(buyerName: $buyerName, sellerId: $sellerId) {
          _id
          name
          counterOffers{
            name
            expirationTime
            counterOfferId
          }
        }
      }`,
        variables: {
          buyerName: newBuyerName,
          sellerId: selectedUser._id
        }
      })
      .then((res) => {
        const buyerData = res?.data?.data?.createBuyer || {};
        if (buyerData._id) {
          const newBuyerOptions = [
            ...buyerOptions,
            {
              label: newBuyerName,
              value: buyerData._id
            }
          ];
          setBuyerOptions(newBuyerOptions);
          setNewBuyerName('');
        }
      });
  };

  const removeDocument = (
    documentName: string,
    userType: string = 'seller'
  ) => {
    if (userType === 'seller') {
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
        .then((res) => {
          if (res.data?.errors) {
            alert(`Error occured: ${res.data.errors[0]}`);
          }
          const filteredDocuments: Document[] = selectedUser.documents.filter(
            ({ name }) => name !== documentName
          );
          const updatedUser = { ...selectedUser, documents: filteredDocuments };
          setUser(updatedUser);
          addDocuments([]);
        });
    }

    const buyerId = selectedBuyer._id;
    return axios
      .post('/api/user/graphqlBuyer', {
        query: `mutation removeDocument ($buyerId: String!, $documentName: String!) {
              removeDocument (buyerId: $buyerId, documentName: $documentName){
                  _id,
                  counterOffers {
                      name,
                      completed,
                      signatureId,
                      counterOfferId
                  }
              }
          }`,
        variables: {
          buyerId,
          documentName
        }
      })
      .then((res) => {
        if (res.data?.errors) {
          alert(`Error occured: ${res.data.errors[0]}`);
        }
        const filteredDocuments: CounterOffers[] = selectedBuyer.counterOffers.filter(
          ({ name }) => name !== documentName
        );
        const updatedBuyer = {
          ...selectedBuyer,
          counterOffers: filteredDocuments
        };
        setBuyer(updatedBuyer);
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

    if (formType === 'buyer') {
      const supportingDocs = [
        'PDPF',
        'EMD',
        'RPAC',
        'PICR',
        'CLA',
        'LCR',
        'ESS'
      ];

      // TODO: we only ever send one document at a time
      // no need for an array here
      if (supportingDocs.includes(documents[0])) {
        return axios
          .post('/api/buyer/graphqlBuyer', {
            operationName: 'addSupportingDocument',
            query: `mutation addSupportingDocument(
          $buyerId: String!,
          $pdfUrl: String!,
          $title: String!
        ){
          addSupportingDocument (buyerId:$buyerId, pdfUrl: $pdfUrl, title: $title){
            _id
            supportingDocuments {
              name
              url
            }
          }
        }`,
            variables: {
              buyerId: selectedBuyer._id,
              pdfUrl,
              title: documents[0]
            }
          })
          .then(() => clearForm())
          .catch(() => clearForm());
      }
      return axios
        .post('/api/buyer/graphqlBuyer', {
          operationName: 'addCounterOffer',
          query: `mutation addCounterOffer(
          $buyerId: String!,
          $sellerId: String!,
          $pdfUrl: String!,
          $expirationTime:String,
          $title: String!
        ){
          addCounterOffer (buyerId:$buyerId, sellerId:$sellerId, pdfUrl: $pdfUrl, expirationTime: $expirationTime, title: $title){
            _id
            counterOffers {
              name
              signatureId
              counterOfferId
              expirationTime
              completed
            }
          }
        }`,
          variables: {
            buyerId: selectedBuyer._id,
            sellerId: selectedUser._id,
            pdfUrl,
            expirationTime: expirationDate.toString(),
            title: documents[0]
          }
        })
        .then(() => clearForm())
        .catch(() => clearForm());
    }

    return axios
      .post('/api/user/graphqlUser', {
        operationName: 'addDocument',
        query: `mutation addDocument ($userId: String!, $address: String!, $county: String!, $parcel: String!, $documents: [String!], $pdfUrl: String!, $expirationTime: String!) {
            addDocument (userId: $userId, documents: $documents, address: $address, parcel: $parcel, county: $county, pdfUrl: $pdfUrl, expirationTime: $expirationTime){
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
          expirationTime: expirationDate.toString(),
          pdfUrl
        }
      })
      .then((res) => {
        // TODO: surface an error if one returned from graphql
        console.log(res);
        clearForm();
      })
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

  const handleBuyerChange = (val: string) => {
    const chosenBuyer = selectedUser.buyers.find(
      (buyer: Buyer) => buyer._id === val
    );
    if (chosenBuyer) {
      setBuyer(chosenBuyer);
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
          <>
            <Form.Item name="Buyer" label="Buyer">
              <Select
                options={buyerOptions}
                onChange={handleBuyerChange}
              ></Select>
            </Form.Item>
            {selectedUser.firstName.length > 0 && (
              <Form.Item label="Create New Buyer">
                <Input
                  type="text"
                  onChange={(e: React.FormEvent<HTMLInputElement>) =>
                    setNewBuyerName(e?.currentTarget?.value)
                  }
                  placeholder={'Buyer Name (First and Last)'}
                />
                <Button
                  onClick={() => createBuyer()}
                  disabled={!newBuyerName.length}
                  type="primary"
                >
                  Add New Buyer
                </Button>
              </Form.Item>
            )}
          </>
        )}
        <>
          {selectedBuyer.counterOffers.length > 0 && (
            <h2>Sent Buyer Documents: </h2>
          )}
          {(selectedBuyer.counterOffers || []).map((doc) => (
            <>
              <Space key={doc.name} align="baseline" style={{ width: '100%' }}>
                <Form.Item>{doc.name}</Form.Item>
                <Form.Item label="Completed">
                  <Input checked={doc.completed} disabled type="checkbox" />
                </Form.Item>
                <MinusCircleOutlined
                  onClick={() => removeDocument(doc.name, 'buyer')}
                />
              </Space>
            </>
          ))}
          <h2>Supporting Documents</h2>
          {(selectedBuyer.supportingDocuments || []).map((doc) => (
            <>
              <Space key={doc.name} align="baseline" style={{ width: '100%' }}>
                <Form.Item>{doc.name}</Form.Item>
              </Space>
            </>
          ))}
        </>
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
                options={documentOptions.filter((doc) =>
                  formType === 'buyer'
                    ? buyerDocs.includes(doc.value)
                    : !buyerDocs.includes(doc.value)
                )}
                onChange={updateForm}
              />
              <Upload {...props}>
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
            </Form.Item>
            <Form.Item label="Expiration For Document">
              <DatePicker size="large" showTime onChange={setDate} />
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
