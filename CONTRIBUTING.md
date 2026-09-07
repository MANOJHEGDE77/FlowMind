# Contributing to FlowMind

Thank you for your interest in contributing to FlowMind! We welcome contributions to our AI Decision Intelligence Platform.

## Development Workflow

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Set up Backend:
   ```bash
   python -m pip install -r backend/requirements.txt
   python -m pytest backend/tests/test_api.py
   ```

3. Set up Frontend:
   ```bash
   cd frontend
   npm install
   npm run build
   ```

4. Code Style & Standards:
   - Backend: Follow PEP 8 and use Pydantic v2 schemas for all payloads.
   - Frontend: Follow React TypeScript best practices with Tailwind CSS. Maintain our minimal, intelligent spatial visual identity.
   - Run tests before committing:
     ```bash
     python -m pytest backend/tests/test_api.py
     cd frontend && npm run build
     ```

5. Submitting Pull Requests:
   - Commit messages should follow conventional commits: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`.
   - Provide clear PR descriptions explaining the problem solved and testing steps performed.
