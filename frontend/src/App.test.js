import { render, screen } from "@testing-library/react";
import App from "./App";
import { AuthProvider } from "./AuthProvider";

test("renders the NextStep app", () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>,
  );
  expect(screen.getByText(/loading nextstep/i)).toBeInTheDocument();
});
