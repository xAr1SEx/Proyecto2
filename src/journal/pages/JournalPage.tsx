import { JournalLayout } from "../layout/JournalLayout";
import { NoteView } from "../views";
export const JournalPage = () => {
  return (
    <JournalLayout>
      {/* <Typography>
        Ex officia velit qui minim. Voluptate adipisicing ut amet dolore anim.
        Ex sit sunt nulla ipsum pariatur incididunt. Culpa sit ullamco sit
        proident dolor pariatur.
      </Typography>
      <MailOutline /> */}
      {/* <NothingSelectedView />

      <IconButton
        size="large"
        sx={{
          color: "white",
          backgroundColor: "error.main",
          ":hover": { backgroundColor: "error.main", opacity: 0.9 },
          position: "fixed",
          right: 50,
          bottom: 50,
        }}
      >
        <AddOutlined sx={{ fontSize: 30 }} />
      </IconButton> */}
      <NoteView />
    </JournalLayout>
  );
};
