#!/usr/bin/env python3
"""
Importa EPICs y TASKs desde BACKLOG.md hacia GitHub Issues.
- Crea labels si no existen
- Crea milestones Entrega 1..6
- Crea EPICs
- Crea TASKs
- Relaciona TASKs con EPICs
- Actualiza EPICs con checklist
"""

import os
import re
import requests

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

if not GITHUB_TOKEN:
    raise ValueError("No existe GITHUB_TOKEN en variables de entorno")

GITHUB_OWNER = "GioJCG"
GITHUB_REPO = "NeoMotors"
BACKLOG_FILE = "BACKLOG.md"

BASE_URL = f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}"

HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github+json"
}

DEFAULT_LABELS = [
    "epic",
    "task",
    "entrega-1",
    "entrega-2",
    "entrega-3",
    "entrega-4",
    "entrega-5",
    "entrega-6",
]


def github_request(method, url, **kwargs):
    response = requests.request(method, url, headers=HEADERS, **kwargs)

    if response.status_code >= 400 and response.status_code != 422:
        print(f"ERROR {response.status_code}: {response.text}")

    return response


def ensure_label(name):
    r = github_request(
        "POST",
        f"{BASE_URL}/labels",
        json={"name": name, "color": "0E8A16"}
    )

    if r.status_code == 201:
        print(f"Label creada: {name}")
    elif r.status_code == 422:
        print(f"Label existente: {name}")


def create_labels():
    for label in DEFAULT_LABELS:
        ensure_label(label)


def get_milestones():
    r = github_request("GET", f"{BASE_URL}/milestones?state=all")

    if r.status_code != 200:
        return {}

    return {m["title"]: m["number"] for m in r.json()}


def ensure_milestone(title):
    milestones = get_milestones()

    if title in milestones:
        print(f"Milestone existente: {title}")
        return milestones[title]

    r = github_request(
        "POST",
        f"{BASE_URL}/milestones",
        json={"title": title}
    )

    if r.status_code == 201:
        print(f"Milestone creada: {title}")
        return r.json()["number"]

    return None


def create_issue(title, body, labels, milestone=None):
    payload = {
        "title": title,
        "body": body,
        "labels": labels
    }

    if milestone:
        payload["milestone"] = milestone

    r = github_request(
        "POST",
        f"{BASE_URL}/issues",
        json=payload
    )

    if r.status_code == 201:
        issue = r.json()
        print(f"✓ #{issue['number']} {title}")
        return issue["number"]

    return None


def update_issue(issue_number, body):
    r = github_request(
        "PATCH",
        f"{BASE_URL}/issues/{issue_number}",
        json={"body": body}
    )
    return r.status_code == 200


def create_milestones():
    result = {}

    for i in range(1, 7):
        title = f"Entrega {i}"
        result[title] = ensure_milestone(title)

    return result


def main():
    with open(BACKLOG_FILE, encoding="utf-8") as f:
        text = f.read()

    entrega_map = {}
    current_entrega = None

    for line in text.splitlines():
        m_entrega = re.match(r"## ENTREGA (\d+)", line)
        if m_entrega:
            current_entrega = m_entrega.group(1)

        m_epic = re.match(r"### EPIC ([^:]+):", line)
        if m_epic and current_entrega:
            entrega_map[m_epic.group(1).strip()] = current_entrega

    print("\\n=== LABELS ===")
    create_labels()

    print("\\n=== MILESTONES ===")
    milestones = create_milestones()

    epic_issues = {}

    print("\\n=== EPICS ===")

    epic_pattern = r"### EPIC\s+([^:]+):\s+(.+)"

    for match in re.finditer(epic_pattern, text):
        epic_id = match.group(1).strip()
        epic_name = match.group(2).strip()

        entrega = entrega_map.get(epic_id)

        milestone = None
        if entrega:
            milestone = milestones.get(f"Entrega {entrega}")

        body = f"""# Epic

Entrega: {entrega}

## Objetivo
{epic_name}

## Tasks
Pendiente de generar.
"""

        issue_number = create_issue(
            f"[EPIC {epic_id}] {epic_name}",
            body,
            ["epic", f"entrega-{entrega}"] if entrega else ["epic"],
            milestone
        )

        epic_issues[epic_id.split()[0]] = {
            "issue": issue_number,
            "name": epic_name,
            "tasks": []
        }

    print("\\n=== TASKS ===")

    task_pattern = (
        r"#### TASK\s+([0-9]+\.[0-9]+\.[0-9]+):\s+(.+?)"
        r"(?=\n#### TASK|\n### EPIC|\n## |\Z)"
    )

    for match in re.finditer(task_pattern, text, re.S):
        task_id = match.group(1).strip()
        block = match.group(2).strip()

        title = block.splitlines()[0].strip()

        epic_id = task_id.split(".")[0]
        epic_data = epic_issues.get(epic_id)

        body = ""

        if epic_data:
            body += f"Parent Epic: #{epic_data['issue']}\n\n"

        body += block

        entrega = entrega_map.get(epic_id)

        milestone = None
        if entrega:
            milestone = milestones.get(f"Entrega {entrega}")

        issue_number = create_issue(
            f"[TASK {task_id}] {title}",
            body,
            ["task", f"entrega-{entrega}"] if entrega else ["task"],
            milestone
        )

        if epic_data and issue_number:
            epic_data["tasks"].append((issue_number, title))

    print("\\n=== ACTUALIZANDO EPICS ===")

    for epic_id, epic_data in epic_issues.items():
        checklist = [
            f"- [ ] #{num} {title}"
            for num, title in epic_data["tasks"]
        ]

        body = f"""# Epic

## Nombre
{epic_data['name']}

## Tasks

{chr(10).join(checklist)}
"""

        if epic_data["issue"]:
            update_issue(epic_data["issue"], body)

        print(f"Checklist actualizada para EPIC {epic_id}")

    print("\\nIMPORTACIÓN FINALIZADA")


if __name__ == "__main__":
    main()
