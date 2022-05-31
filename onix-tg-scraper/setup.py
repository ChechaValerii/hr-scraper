import json
import os.path


def check_config():
    if os.path.exists('config.json'):
        with open('config.json', 'r') as f:
            data = json.load(f)
    else:
        api_id = input('Enter api id: ')
        api_hash = input('Enter api hash: ')
        user_data = {}
        user_data['api_id'] = int(api_id)
        user_data['api_hash'] = str(api_hash)

        with open('config.json', 'w') as f:
            f.write(json.dumps(user_data))
        with open('config.json', 'r') as f:
            data = json.load(f)
    return data


def enter_group(group):
    with open('config.json', 'r+') as f:
        data = json.load(f)
        if 'groups' not in data:
            data['groups'] = []
        if group not in data['groups']:
            data['groups'].append(group)
            f.seek(0)
            json.dump(data, f, indent=4)

    return group


def get_groups(user_input):
    with open('config.json', 'r') as f:
        data = json.load(f)
    groups = {}
    for i, group in enumerate(data['groups']):
        groups[i] = group

    return groups[int(user_input)]


def user_group_input():
    with open('config.json', 'r') as f:
        data = json.load(f)
    if 'groups' in data:
        groups = {}
        for i, group in enumerate(data['groups']):
            groups[i] = group
        for key, value in groups.items():
            print(f'[{key}] - {value}')

    user_group = input('Choose the group or enter the new one: ')

    if user_group.isdecimal():
        return get_groups(user_group)
    else:
        return enter_group(str(user_group))
