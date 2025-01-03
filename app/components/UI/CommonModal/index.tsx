import {
    Button,
    Modal,
    LegacyStack,
    TextContainer,
    Frame,
  } from '@shopify/polaris';
  import { ReactNode } from 'react';
  
  interface CommonModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    primaryAction?: {
      content: string;
      onAction: () => void;
    };
    children: ReactNode;
    activatorContent?: string;
  }
  
  export function CommonModal({
    open,
    onClose,
    title,
    primaryAction = {
      content: 'Close',
      onAction: () => onClose(),
    },
    children,
    activatorContent = 'Open',
  }: CommonModalProps) {
    const activator = <Button onClick={onClose}>{activatorContent}</Button>;
  
    return (
      <Frame>
        <Modal
          activator={activator}
          open={open}
          onClose={onClose}
          title={title}
          primaryAction={primaryAction}
        >
          <Modal.Section>
            <LegacyStack vertical>
              <LegacyStack.Item>
                <TextContainer>
                  {children}
                </TextContainer>
              </LegacyStack.Item>
            </LegacyStack>
          </Modal.Section>
        </Modal>
      </Frame>
    );
  }
  