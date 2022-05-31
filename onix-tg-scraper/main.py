import csv
import json
import pyfiglet

from pyrogram import Client

from setup import check_config, user_group_input


app = Client("scrap_app", check_config()['api_id'], check_config()['api_hash'])


async def main():
    print(pyfiglet.figlet_format("Let's Scrap"))

    try:
        async with app:
            users = []
            group = user_group_input()
            chat = await app.get_chat(group)
            group_id, group_title = chat.id, chat.title
            a = app.get_chat_members(group_id)
            async for member in a:
                users.append(member)

        file_format = input('Enter file format (csv or json): ')
        print('Saving to the file...')
        if file_format.lower() == 'csv':
            convert_to_csv(users, group_title)
        if file_format.lower() == 'json':
            convert_to_json(users, group_title)
        print('Done!')
    except Exception as e:
        print(e)


def convert_to_json(data, group=None):
    users_dict = {}
    for x, i in enumerate(data):
        users_dict[x] = {'username': i.user.username, 'user id': i.user.id, 'first name': i.user.first_name,
                         'last name': i.user.last_name, 'contact': i.user.is_contact,
                         'mutual_contact': i.user.is_mutual_contact, 'verified': i.user.is_verified}
    with open(f'{group}.json', 'w', encoding='UTF-8') as f:
        f = json.dump(users_dict, f, indent=4, sort_keys=True, ensure_ascii=False, default=str)


def convert_to_csv(data, group=None):
    with open(f'{group}.csv', 'w', encoding='UTF-8') as f:
        writer = csv.writer(f, delimiter=",", lineterminator="\n")
        writer.writerow(['username', 'user id', 'first name', 'last name',
                         'contact', 'mutual_contact', 'verified'])
        for i in data:
            writer.writerow([i.user.username, i.user.id, i.user.first_name, i.user.last_name,
                             i.user.is_contact, i.user.is_mutual_contact, i.user.is_verified])


app.run(main())
