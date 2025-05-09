---
title: "How to generate Pydantic models with optional fields"
description: "Learn how to make all fields optional starting from an existing model."
date: "May 6 2025"
---

[Pydantic](https://docs.pydantic.dev/latest/) is a great data-validation library that we use to define the models of the entities that live in our database. I like the fact that is as simple as declaring a type hint to get your data validated. But sometimes you'd like to have a slightly different version of your model.

# The problem
Let’s start with a basic example. Suppose you have a database model like this:
```python
from pydantic import BaseModel

class User(BaseModel):
	id: int
	first_name: str
	last_name: str
```

This model mirrors the structure of your database. So far, so good.

Now, say you want to create a new `User`. You can’t provide the `id` up front -- it gets generated when the user is created. So, you define a new model:
```python
class UserCreate(BaseModel):
	name: str
	last_name: str
```

Great, that works. But what about updating a user? You may want to change just the `first_name`, or just the `last_name`, or both. So you add:
```python
class UserUpdate(BaseModel):
	name: str | None
	last_name: str | None
```

Now you’re repeating fields across multiple classes. Every time the original `User` model changes, you have to manually update `UserCreate` and `UserUpdate` to stay in sync. If your app has lots of models, this quickly becomes tedious—and error-prone.

# A first possible solution
After browsing a bit on the internet, I found [this issue](https://github.com/pydantic/pydantic/issues/3120) in Pydantic's github repository. It addresses exactly this pain point: how to derive a version of an existing model where all fields are optional.

Here’s the workaround suggested in the thread:

```python
from copy import deepcopy
from typing import Any, Optional, Tuple, Type, TypeVar

from pydantic import BaseModel, create_model
from pydantic.fields import FieldInfo


class User(BaseModel):
  first_name: str
  last_name: str


def make_field_optional(field: FieldInfo, default: Any = None) -> Tuple[Any, FieldInfo]:
  new = deepcopy(field)
  new.default = default
  new.annotation = Optional[field.annotation]  # type: ignore
  return (new.annotation, new)


BaseModelT = TypeVar('BaseModelT', bound=BaseModel)

def make_partial_model(model: Type[BaseModelT]) -> Type[BaseModelT]:
  return create_model(  # type: ignore
    f'Partial{model.__name__}',
    __base__=User,
    __module__=User.__module__,
    **{
        field_name: make_field_optional(field_info)
        for field_name, field_info in User.model_fields.items()
    }
    )


PartialUser = make_partial_model(User)


print(PartialUser(first_name='Adrian'))
#> first_name='Adrian' last_name=None
```

The proposed solution works, but there's a catch: you won't get any help from type hints, because `PartialUser` is considered of type `type[User]`. For that, you'll also get linting errors when not specifying all the parameters like: `Argument missing for parameter "last_name"`.

# A better solution
Since doing this in a dynamic way would sacrifice type hints, I came up with a different idea. What if we could **generate these partial models programmatically**, starting from the original model?

That’s exactly what my solution does: it's a script that scans your Pydantic models and creates copies where all fields are preserved -- including type hints -- but made optional.

## Key Features
- Supports both **Pydantic v1** and **Pydantic v2**
- **Automatically generates** partial models from existing ones
- **Detects changes** in model name, field names, or types to determine whether regeneration is needed
- Use a simple `@generate_partial` decorator to flag models for generation
- Add **custom methods** to the generated models without worrying about overwrites
- Includes a base class for partial models where you can define shared logic or behavior


You can find the script and a minimal working example in the [dedicated GitHub repository](https://github.com/alemar99/pydantic-optional-models).

