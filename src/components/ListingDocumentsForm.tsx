import React, { useState } from 'react';
import { Form, Input, Button, Space, Select, Upload } from 'antd';
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons';

type HouseObject = {
  label: string;
  value: string;
};

const ListingDocumentsForm = () => {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<FormData>(new FormData());
  const [houseOptions, setHouseOptions] = useState<HouseObject[]>([]);

  const handleChange = () => {
    form.setFieldsValue({ sights: [] });
  };

  const updateForm = (name: string, val: any) => {
    formData.set(name, val);
    setFormData(formData);
  };

  const updateFormFiles = (name: string, file: File) => {
    formData.append('files', file);
    setFormData(formData);
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const onFinish = () => {
    // TODO: submit form
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
          name="Property"
          label="Property"
          rules={[{ required: true, message: 'Missing area' }]}
        >
          <Select options={houseOptions} onChange={handleChange} />
        </Form.Item>
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
                      prevValues.area !== curValues.area ||
                      prevValues.sights !== curValues.sights
                    }
                  >
                    {() => (
                      <Form.Item {...field} label="Document Name">
                        <Input />
                      </Form.Item>
                    )}
                  </Form.Item>
                  <Form.Item
                    name="upload"
                    label="Upload"
                    valuePropName="fileList"
                    getValueFromEvent={normFile}
                  >
                    <Upload name="logo" action="/upload.do" listType="picture">
                      <Button icon={<UploadOutlined />}>Click to upload</Button>
                    </Upload>
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
