import os
from lmnr import evaluate
import random

# openai_client = AsyncOpenAI(
#     api_key=os.environ["OPENAI_API_KEY"]
# )


async def get_capital(data):
    return random.choice(["Washington, D.C.", "Ottawa", "Berlin"])
    # country = data["country"]
    # response = await openai_client.chat.completions.create(
    #     model="gpt-4o-mini",
    #     messages=[
    #         {"role": "system", "content": "You are a helpful assistant."},
    #         {
    #             "role": "user",
    #             "content": f"What is the capital of {country}?",
    #         },
    #     ],
    # )
    # return response.choices[0].message.content.strip()


# # Evaluation data
data = [
    {"data": {"country": "United States"}, "target": {"capital": "Washington, D.C."}},
    {"data": {"country": "Canada"}, "target": {"capital": "Ottawa"}},
    {"data": {"country": "Germany"}, "target": {"capital": "Berlin"}},
]


def exact_match(output, target):
    return 1 if target["capital"] == output else 0


def presence(output, target):
    return 1 if target["capital"] in output else 0


def word_count(output, target):
    return len(output.split())


def rand(output, target):
    return random.random()


evaluate(
    name="demo_eval",
    data=data,
    executor=get_capital,
    evaluators={
        "presence": presence,
        "exact_match": exact_match,
        "word_count": word_count,
        "random": rand,
    },
)
