import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import NewHintModal from './HintModal';

// Mock the hooks from the original file
const mockPause = jest.fn();
const mockUnPause = jest.fn();
const mockInteractEnd = jest.fn();

jest.mock('../../../hooks/useTownController', () => ({
  __esModule: true,
  default: () => ({
    pause: mockPause,
    unPause: mockUnPause,
    interactEnd: mockInteractEnd,
  }),
}));

const mockUseInteractable = jest.fn();

jest.mock('../../../classes/TownController', () => ({
  useInteractable: mockUseInteractable,
}));

describe('HintModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(
      <ChakraProvider>
        <NewHintModal />
      </ChakraProvider>
    );
  });

  it('renders closed by default', () => {
    const { queryByText } = render(
      <ChakraProvider>
        <NewHintModal />
      </ChakraProvider>
    );
    expect(queryByText('Hint')).toBeNull();
  });

  it('opens when hintDisplay is defined', () => {
    mockUseInteractable.mockReturnValueOnce({});
    const { getByText } = render(
      <ChakraProvider>
        <NewHintModal />
      </ChakraProvider>
    );
    expect(getByText('Hint')).toBeDefined();
  });

  it('closes when the close button is clicked', async () => {
    mockUseInteractable.mockReturnValueOnce({});
    const { getByText } = render(
      <ChakraProvider>
        <NewHintModal />
      </ChakraProvider>
    );
    fireEvent.click(getByText('Close'));
    await waitFor(() => expect(getByText('Hint')).toBeNull());
  });

  it('displays the first hint for each room by default', () => {
    mockUseInteractable.mockReturnValueOnce({ displayHint: () => 1 });
    const { getByText } = render(
      <ChakraProvider>
        <NewHintModal />
      </ChakraProvider>
    );
    expect(getByText('Count the Legs')).toBeDefined();
  });

  it('cycles through hints when the next hint button is clicked', async () => {
    mockUseInteractable.mockReturnValueOnce({ displayHint: () => 1 });
    const { getByText } = render(
      <ChakraProvider>
        <NewHintModal />
      </ChakraProvider>
    );
    fireEvent.click(getByText('Next Hint'));
    await waitFor(() =>
      expect(getByText('The key to open the door is in the lockbox.')).toBeDefined(),
    );
  });

  it('pauses the game when opened', () => {
    mockUseInteractable.mockReturnValueOnce({});
    render(
      <ChakraProvider>
        <NewHintModal />
      </ChakraProvider>
    );
    expect(mockPause).toHaveBeenCalled();
  });

  it('unpauses the game when closed', async () => {
    mockUseInteractable.mockReturnValueOnce({});
    const { getByText } = render(
      <ChakraProvider>
        <NewHintModal />
      </ChakraProvider>
    );
    fireEvent.click(getByText('Close'));
    await waitFor(() => expect(mockUnPause).toHaveBeenCalled());
  });

  it('calls interactEnd when closed', async () => {
    mockUseInteractable.mockReturnValueOnce({});
    const { getByText } = render(
      <ChakraProvider>
        <NewHintModal />
      </ChakraProvider>
    );
    fireEvent.click(getByText('Close'));
    await waitFor(() => expect(mockInteractEnd).toHaveBeenCalled());
  });

  it('does not crash when hintDisplay is undefined', () => {
    mockUseInteractable.mockReturnValueOnce(undefined);
    render(
      <ChakraProvider>
        <NewHintModal />
      </ChakraProvider>
    );
  });
});