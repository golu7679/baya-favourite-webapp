import { useEffect, useState } from "react";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import {
  Button,
  Card,
  Group,
  MantineProvider,
  Text,
  TextInput,
  PasswordInput,
  Stack,
  LoadingOverlay,
  Avatar,
  Menu,
  rem,
  Center,
  Autocomplete,
  Container,
  Grid,
  Flex,
  Modal,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAt,
  IconCancel,
  IconCheck,
  IconLock,
  IconTrash,
} from "@tabler/icons-react";
import { Notifications, notifications } from "@mantine/notifications";
import axios from "axios";

import categoryList from "./categoryList";
import QuoteCard from "./components/QuoteCard";

function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(
    localStorage.getItem("user_logged_in") === "true" ?? false,
  );
  const [visible] = useDisclosure(false);
  const [quoteCategory, setQuoteCategory] = useState("");
  const [alertModal, { toggle: toggleAlertModal }] = useDisclosure(false);
  const [showEditModal, { toggle: setShowEditModal }] = useDisclosure(false);
  const [selectedToEdit, setSelectedToEdit] = useState<any>({});

  const [generatedQuote, setGeneratedQuote] = useState<any>({});
  const [savedQuotesInLocal, setSavedQuotesInLocal] = useState<any[]>([]);

  const [apiCalling, setApiCalling] = useState(false);

  const getQuote = async () => {
    try {
      const { data } = await axios.get(
        `https://api.api-ninjas.com/v1/quotes?category=${quoteCategory.toLowerCase()}`,
        {
          headers: {
            "X-Api-Key": process.env.REACT_APP_API_KEY,
          },
        },
      );
      setApiCalling(false);
      setGeneratedQuote({ ...data[0], isFav: false });
    } catch (e: any) {
      setApiCalling(false);

      notifications.show({
        color: "red",
        title: "Error",
        message: e.response.data.error ?? "Something went wrong",
      });
    }
  };

  const logout = () => {
    toggleAlertModal();
    setGeneratedQuote({});
    localStorage.removeItem('user_logged_in');
    setUserLoggedIn(false);
  };

  const loginForm = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) => (value ? null : "Please enter password"),
    },
  });

  const editQuoteForm = useForm({
    initialValues: {
      author: "",
      quote: "",
      category: "",
    },

    validate: {
      author: (value) => (value ? null : "Please enter author name"),
      quote: (value) => (value ? null : "Please enter quote"),
      category: (value) => (value ? null : "Please enter category"),
    },
  });

  const setSubmittedValues = async (e: { email: string; password: string }) => {
    console.log(process.env)
    if (
      e.email !== process.env.REACT_APP_LOGIN_EMAIL ||
      e.password !== process.env.REACT_APP_LOGIN_PASSWORD
    ) {
      notifications.show({
        color: "red",
        title: "Wrong credential",
        message: "Please check your email and password",
      });

      return;
    }

    setUserLoggedIn(true);
    localStorage.setItem("user_logged_in", "true");
    notifications.show({
      title: "Success",
      message: "Successfully logged in",
      color: "green",
    });
  };

  const quoteEditAction = (data: any) => {
    setSelectedToEdit(data);
    setShowEditModal();
    editQuoteForm.setValues({
      author: data.author,
      quote: data.quote,
      category: data.category,
    });
  };

  const updateQuote = (data: any) => {
    let savedData: any = localStorage.getItem("saved_quotes");

    if (savedData) {
      savedData = JSON.parse(savedData);

      const index = savedData.findIndex(
        (item: any) => item.id == selectedToEdit.id,
      );

      savedData[index] = {
        ...data,
      };

      setSavedQuotesInLocal(savedData);
      localStorage.setItem("saved_quotes", JSON.stringify(savedData));
      setShowEditModal();
      notifications.show({
        title: "Success",
        message: "Quote updated successfully",
        color: "green",
      });
    }
  };

  const newQuoteMarkedAsFav = (data: boolean) => {
    let savedData: any = localStorage.getItem("saved_quotes");

    if (!savedData) savedData = [];
    else savedData = JSON.parse(savedData);

    // when marking quote as favourite
    if (data) {
      const modifiedData = {
        ...generatedQuote,
        id: Date.now(),
        isFav: true,
      };

      setGeneratedQuote({ ...modifiedData });

      // delete modifiedData.isFav;

      savedData.push(modifiedData);
      setSavedQuotesInLocal(savedData);
      localStorage.setItem("saved_quotes", JSON.stringify(savedData));

      return;
    }

    savedData = savedData.filter(
      (item: any) => +item.id !== +generatedQuote.id,
    );
    setSavedQuotesInLocal(savedData);

    localStorage.setItem("saved_quotes", JSON.stringify(savedData));
  };

  const oldQuoteFavAction = (status: boolean, data: any) => {
    let savedData: any = localStorage.getItem("saved_quotes");

    if (!savedData) savedData = [];
    else savedData = JSON.parse(savedData);

    if (status) {
      savedData.push(data);
      setSavedQuotesInLocal(savedData);
      localStorage.setItem("saved_quotes", JSON.stringify(savedData));
    }

    savedData = savedData.filter((item: any) => +item.id !== +data.id);
    if (data.id === generatedQuote.id) {
      console.log("insider here ")
      setGeneratedQuote({
        ...generatedQuote,
        isFav: false,
      });
    }
    setSavedQuotesInLocal(savedData);
    localStorage.setItem("saved_quotes", JSON.stringify(savedData));
  };

  useEffect(() => {
    const savedData = localStorage.getItem("saved_quotes");

    if (savedData) {
      setSavedQuotesInLocal(JSON.parse(savedData));
    }
  }, []);

  return (
    <MantineProvider>
      <LoadingOverlay
        visible={visible}
        zIndex={1000}
        overlayProps={{ radius: "sm", blur: 2 }}
      />
      <Notifications position="top-right" zIndex={1000} />
      <Modal
        opened={alertModal}
        onClose={toggleAlertModal}
        title="Alert"
        size={"auto"}
        centered
      >
        <Flex justify={"center"} pb={15}>
          <Text>Are you sure you want to logout?</Text>
        </Flex>

        <Group justify="center">
          <Button leftSection={<IconCancel size={14} />} variant="default" onClick={toggleAlertModal}>
            Cancel
          </Button>
          <Button leftSection={<IconCheck size={14} />} color="red" onClick={logout}>
            Yes
          </Button>
        </Group>
      </Modal>

      <Modal
        opened={showEditModal}
        onClose={setShowEditModal}
        title="Edit Quote"
        size={"md"}
        centered
      >
        <form onSubmit={editQuoteForm.onSubmit(updateQuote)}>
          <Stack>
            <TextInput
              withAsterisk
              label="Author"
              placeholder="Author"
              key={editQuoteForm.key("author")}
              value={selectedToEdit.author}
              {...editQuoteForm.getInputProps("author")}
            />

            <TextInput
              withAsterisk
              label="Category"
              placeholder="Category"
              key={editQuoteForm.key("category")}
              value={selectedToEdit.category}
              {...editQuoteForm.getInputProps("category")}
            />

            <Textarea
              withAsterisk
              label="Quote"
              placeholder="Quote"
              key={editQuoteForm.key("quote")}
              value={selectedToEdit.quote}
              {...editQuoteForm.getInputProps("quote")}
            />
          </Stack>

          <Button type="submit" mt="md" fullWidth>
            Update
          </Button>
        </form>
      </Modal>

      {userLoggedIn ? (
        <>
          <Menu shadow="md" width={200}>
            <Group justify={"space-between"} px={30} py={20}>
              <Text
                size="xl"
                fw={900}
                variant="gradient"
                gradient={{ from: "blue", to: "cyan", deg: 90 }}
              >
                Favourite Quotes WebApp
              </Text>
              <Menu.Target>
                <Group style={{ cursor: "pointer" }}>
                  <Avatar radius="xl" />
                  <Text size="lg" fw={500}>
                    Golu Rajak
                  </Text>
                </Group>
              </Menu.Target>
            </Group>

            <Menu.Dropdown>
              <Menu.Item
                color="red"
                leftSection={
                  <IconTrash style={{ width: rem(14), height: rem(14) }} />
                }
                onClick={() => toggleAlertModal()}
              >
                Logout
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          <Container>
            <Stack align="center" justify="center" gap="md" mb={20}>
              <Text
                size="xl"
                fw={900}
                variant="gradient"
                gradient={{ from: "blue", to: "cyan", deg: 90 }}
              >
                Generate Quote
              </Text>

              {!!Object.keys(generatedQuote).length && (
                <QuoteCard
                  author={generatedQuote["author"]}
                  category={generatedQuote["category"]}
                  quote={generatedQuote["quote"]}
                  isFav={generatedQuote["isFav"]}
                  markAsFavAction={(e) => newQuoteMarkedAsFav(e)}
                />
              )}
            </Stack>

            <Grid justify="space-around" align="flex-end">
              <Grid.Col span={"auto"}>
                <Autocomplete
                  placeholder="Select or type category"
                  data={categoryList}
                  onChange={setQuoteCategory}
                />
              </Grid.Col>

              <Grid.Col span={2}>
                <Button
                  loaderProps={{ type: "dots" }}
                  fullWidth
                  onClick={() => {
                    setApiCalling(true);
                    getQuote();
                  }}
                  loading={apiCalling}
                >
                  Get Quote
                </Button>
              </Grid.Col>
            </Grid>
          </Container>

          <Grid m={10}>
            {savedQuotesInLocal.map((item) => (
              <Grid.Col key={item.id} span={4}>
                <QuoteCard
                  key={item.id}
                  author={item.author}
                  category={item.category}
                  isFav={true}
                  markAsFavAction={(e) => oldQuoteFavAction(e, item)}
                  quote={item.quote}
                  onEditAction={() => quoteEditAction(item)}
                />
              </Grid.Col>
            ))}
          </Grid>
        </>
      ) : (
        <>
          <Center h={"100vh"}>
            <Card shadow="sm" radius="md" withBorder style={{ width: 500 }}>
              <Group justify="center" mb="xs">
                <Text fw={500}>Favourite Quotes WebApp</Text>
              </Group>

              <form onSubmit={loginForm.onSubmit(setSubmittedValues)}>
                <Stack>
                  <TextInput
                    withAsterisk
                    label="Email"
                    placeholder="your@email.com"
                    key={loginForm.key("email")}
                    {...loginForm.getInputProps("email")}
                    leftSection={<IconAt size={16} />}
                  />

                  <PasswordInput
                    label="Password"
                    withAsterisk
                    placeholder="Password"
                    key={loginForm.key("password")}
                    {...loginForm.getInputProps("password")}
                    leftSection={<IconLock size={16} />}
                  />
                </Stack>

                <Button type="submit" mt="md" fullWidth>
                  Submit
                </Button>
              </form>
            </Card>
          </Center>
        </>
      )}
    </MantineProvider>
  );
}

export default App;
