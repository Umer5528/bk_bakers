import { useEffect } from "react";

// Keeps each route's browser tab title (and therefore what shows in
// history/bookmarks and search-engine result snippets once this is
// server-rendered or pre-rendered) meaningful instead of a single
// static title for the whole app.
const useDocumentTitle = (title) => {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} | Bk_Bakers` : "Bk_Bakers | Artistry You Can Taste";
    return () => {
      document.title = previous;
    };
  }, [title]);
};

export default useDocumentTitle;
